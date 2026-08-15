<?php

namespace App\Services;

use App\Models\Surat;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use setasign\Fpdi\Fpdi;

class FinalSuratPdfService
{
    /**
     * Creates the immutable final PDF with its QR verification badge.
     *
     * @return array{path: string, original_name: string, size: int, mime: string}
     */
    public function create(Surat $surat, string $verificationUrl): array
    {
        $draft = $surat->file_draft;
        $position = $surat->qr_position;

        if (!isset($draft['path']) || !Storage::disk('private')->exists($draft['path'])) {
            throw new RuntimeException('File draft surat tidak ditemukan.');
        }

        if (!$position) {
            throw new RuntimeException('Posisi QR Code belum ditentukan.');
        }

        $disk = Storage::disk('private');
        $temporaryDirectory = $disk->path('temporary');
        if (!is_dir($temporaryDirectory)) {
            mkdir($temporaryDirectory, 0775, true);
        }

        $identifier = $surat->verification_token;
        $qrPath = $temporaryDirectory . DIRECTORY_SEPARATOR . "{$identifier}-qr.png";
        $badgePath = $temporaryDirectory . DIRECTORY_SEPARATOR . "{$identifier}-badge.png";
        $finalPath = "finals/{$surat->approved_at->format('Y')}/{$identifier}.pdf";
        $finalAbsolutePath = $disk->path($finalPath);

        try {
            $this->createQrCode($verificationUrl, $qrPath);
            $this->stampPdf($surat, $disk->path($draft['path']), $qrPath, $badgePath, $finalAbsolutePath, $position, $verificationUrl);
        } finally {
            @unlink($qrPath);
            @unlink($badgePath);
        }

        return [
            'path' => $finalPath,
            'original_name' => pathinfo($draft['original_name'] ?? 'surat', PATHINFO_FILENAME) . '-final.pdf',
            'size' => filesize($finalAbsolutePath),
            'mime' => 'application/pdf',
        ];
    }

    private function createQrCode(string $verificationUrl, string $path): void
    {
        Builder::create()
            ->writer(new PngWriter())
            ->writerOptions([])
            ->data($verificationUrl)
            ->size(500)
            ->margin(12)
            ->validateResult(false)
            ->build()
            ->saveToFile($path);
    }

    private function stampPdf(Surat $surat, string $draftPath, string $qrPath, string $badgePath, string $finalPath, array $position, string $verificationUrl): void
    {
        $pdf = new Fpdi();
        $pageCount = $pdf->setSourceFile($draftPath);
        $badgeCreated = false;

        for ($page = 1; $page <= $pageCount; $page++) {
            $template = $pdf->importPage($page);
            $size = $pdf->getTemplateSize($template);
            $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
            $pdf->useTemplate($template);

            if ($page === (int) $position['page']) {
                $width = max(45, min($size['width'] * (float) $position['width'], $size['width']));
                $height = max(16, min($size['height'] * (float) $position['height'], $size['height']));
                $x = min(max(0, $size['width'] * (float) $position['x']), $size['width'] - $width);
                $y = min(max(0, $size['height'] * (float) $position['y']), $size['height'] - $height);

                if (!$badgeCreated) {
                    $this->createBadge($surat, $qrPath, $badgePath, $width, $height, $verificationUrl);
                    $badgeCreated = true;
                }

                $pdf->Image($badgePath, $x, $y, $width, $height, 'PNG');
            }
        }

        if (!$badgeCreated) {
            throw new RuntimeException('Halaman posisi QR Code tidak ditemukan pada PDF.');
        }

        $directory = dirname($finalPath);
        if (!is_dir($directory)) {
            mkdir($directory, 0775, true);
        }
        $pdf->Output('F', $finalPath);
    }

    private function createBadge(Surat $surat, string $qrPath, string $badgePath, float $widthMm, float $heightMm, string $verificationUrl): void
    {
        $scale = 8;
        $width = max(360, (int) round($widthMm * $scale));
        $height = max(128, (int) round($heightMm * $scale));
        $badge = imagecreatetruecolor($width, $height);
        $white = imagecolorallocate($badge, 255, 255, 255);
        $border = imagecolorallocate($badge, 156, 163, 175);
        $dark = imagecolorallocate($badge, 30, 41, 59);

        imagefill($badge, 0, 0, $white);
        
        // Garis batas hanya di bawah dan tipis
        imageline($badge, 0, $height - 1, $width - 1, $height - 1, $border);

        $padding = (int) round($height * 0.12);
        $qrSize = $height - (2 * $padding);
        $qr = imagecreatefrompng($qrPath);
        imagecopyresampled($badge, $qr, $padding, $padding, 0, 0, $qrSize, $qrSize, imagesx($qr), imagesy($qr));
        imagedestroy($qr);

        $fontPath = base_path('vendor/endroid/qr-code/assets/open_sans.ttf');
        $textX = $padding + $qrSize + (int) round($height * 0.11);
        $lineY = $padding + 12; // Baseline for TTF
        
        // TTE oleh :
        imagettftext($badge, 8, 0, $textX, $lineY, $dark, $fontPath, 'TTE oleh :');
        $lineY += 16;
        
        // NAMA APPROVER
        $namaApprover = strtoupper($this->ascii($surat->approvedBy?->name ?? 'APPROVER'));
        imagettftext($badge, 10, 0, $textX, $lineY, $dark, $fontPath, $namaApprover);
        imagettftext($badge, 10, 0, $textX + 1, $lineY, $dark, $fontPath, $namaApprover); // Emulate bold
        $lineY += 18;
        
        // Tanggal dan Jam
        $tanggal = $surat->approved_at ? $surat->approved_at->translatedFormat('d F Y H:i:s') . ' WIB' : date('d F Y H:i:s') . ' WIB';
        imagettftext($badge, 8, 0, $textX, $lineY, $dark, $fontPath, $tanggal);
        $lineY += 28; // Jarak yang diperbesar/diperjauh
        
        // Verifikasi melalui
        imagettftext($badge, 8, 0, $textX, $lineY, $dark, $fontPath, 'Verifikasi melalui');
        $lineY += 16;
        
        // URL Web
        $scheme = parse_url($verificationUrl, PHP_URL_SCHEME) ?? 'https';
        $host = parse_url($verificationUrl, PHP_URL_HOST) ?? 'esurat.pissya.or.id';
        $shortUrl = $scheme . '://' . $host;
        imagettftext($badge, 8, 0, $textX, $lineY, $dark, $fontPath, $this->ascii($shortUrl));

        imagepng($badge, $badgePath);
        imagedestroy($badge);
    }

    private function ascii(string $value): string
    {
        return iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value;
    }
}
