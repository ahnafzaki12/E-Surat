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
        $logoPath = public_path('favicon.png');
        
        $builder = Builder::create()
            ->writer(new PngWriter())
            ->writerOptions([])
            ->data($verificationUrl)
            ->size(500)
            ->margin(0)
            ->validateResult(false);

        if (file_exists($logoPath)) {
            $builder->logoPath($logoPath)->logoResizeToWidth(120)->logoPunchoutBackground(true);
        }

        $builder->build()->saveToFile($path);
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
                $width = min($size['width'] * (float) $position['width'], $size['width']);
                $height = min($size['height'] * (float) $position['height'], $size['height']);
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
        // Dynamic scale based on physical mm size, to preserve the exact aspect ratio drawn by the user
        $scale = 10;
        $width = max(100, (int) round($widthMm * $scale));
        $height = max(30, (int) round($heightMm * $scale));

        $badge = imagecreatetruecolor($width, $height);
        
        $white = imagecolorallocate($badge, 255, 255, 255);
        $black = imagecolorallocate($badge, 0, 0, 0);

        imagefill($badge, 0, 0, $white);
        
        // Full outline box without rounded corners
        imagesetthickness($badge, max(1, (int) round($scale * 0.2))); // slightly thicker border
        imagerectangle($badge, 0, 0, $width - 1, $height - 1, $black);

        // Reset thickness for other drawing if necessary
        imagesetthickness($badge, 1);

        // Calculate font sizes proportional to canvas height
        $baseFontSizePt = max(6, $height * 0.09 * 0.75); 
        $largeFontSizePt = max(8, $height * 0.10 * 0.75); 
        $lineSpacing = (int) round($height * 0.13); // Vertical distance between lines
        
        // Calculate dimensions
        $padding = (int) round($height * 0.04); // 4% padding all around
        $qrSize = $height - (2 * $padding);
        $textGap = (int) round($height * 0.04); // Padding between QR and text
        
        // Insert QR Code on the left
        $qr = imagecreatefrompng($qrPath);
        imagecopyresampled($badge, $qr, $padding, $padding, 0, 0, $qrSize, $qrSize, imagesx($qr), imagesy($qr));
        imagedestroy($qr);

        $textX = $padding + $qrSize + $textGap;
        
        $fontPath = base_path('vendor/endroid/qr-code/assets/open_sans.ttf');
        
        // Vertically center the text groups
        $totalTextHeight = (int) round($lineSpacing * 1.05 * 4 + $lineSpacing * 1.5); // 5 lines (4 gaps) + 1 extra gap between groups
        $lineY = ($height - $totalTextHeight) / 2 + $baseFontSizePt;
        
        // Group 1: TTE oleh
        imagettftext($badge, $baseFontSizePt, 0, $textX, (int)$lineY, $black, $fontPath, 'TTE oleh :');
        $lineY += (int) round($lineSpacing * 1.05);
        
        // Group 1: NAMA APPROVER
        $namaApprover = strtoupper($this->ascii($surat->approvedBy?->name ?? 'APPROVER'));
        imagettftext($badge, $largeFontSizePt, 0, $textX, (int)$lineY, $black, $fontPath, $namaApprover);
        imagettftext($badge, $largeFontSizePt, 0, $textX + 1, (int)$lineY, $black, $fontPath, $namaApprover); // Emulate bold
        $lineY += (int) round($lineSpacing * 1.05);
        
        // Group 1: Tanggal dan Jam
        $tanggal = $surat->approved_at ? $surat->approved_at->translatedFormat('d F Y H:i:s') . ' WIB' : date('d F Y H:i:s') . ' WIB';
        imagettftext($badge, $baseFontSizePt, 0, $textX, (int)$lineY, $black, $fontPath, $tanggal);
        
        // Gap between groups
        $lineY += (int) round($lineSpacing * 1.5);
        
        // Group 2: Verifikasi melalui
        imagettftext($badge, $baseFontSizePt, 0, $textX, (int)$lineY, $black, $fontPath, 'Verifikasi melalui');
        $lineY += (int) round($lineSpacing * 1.05);

        // Group 2: URL Web
        $scheme = parse_url($verificationUrl, PHP_URL_SCHEME) ?? 'https';
        $host = parse_url($verificationUrl, PHP_URL_HOST) ?? 'esurat.pissya.or.id';
        $shortUrl = $scheme . '://' . $host;
        imagettftext($badge, $baseFontSizePt, 0, $textX, (int)$lineY, $black, $fontPath, $this->ascii($shortUrl));

        imagepng($badge, $badgePath);
        imagedestroy($badge);
    }

    private function ascii(string $value): string
    {
        return iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value;
    }
}
