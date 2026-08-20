<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #374151;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f9fafb; padding: 40px 0;">
        <tr>
            <td align="center">
                <!-- Logo Top -->
                <div style="margin-bottom: 24px; text-align: center;">
                    <h1 style="color: #9ca3af; font-size: 24px; margin: 0; font-weight: bold; letter-spacing: 1px;">E-SURAT</h1>
                </div>

                <!-- Main Card -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                    <!-- Banner -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center;">
                            <h2 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 800; letter-spacing: 0.5px;">Surat Ditolak</h2>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #1f2937;">
                                Halo <strong>{{ $surat->createdBy->name ?? 'Sekretaris' }}</strong>,
                            </p>
                            <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #4b5563;">
                                Mohon maaf, pengajuan surat Anda telah <strong>ditolak</strong> oleh Approver. Berikut adalah detail surat dan alasan penolakannya:
                            </p>

                            <!-- Details -->
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 20px; background-color: #f3f4f6; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 10px 0; font-size: 15px; color: #374151;"><strong>Perihal:</strong> {{ $surat->perihal }}</p>
                                        <p style="margin: 0 0 10px 0; font-size: 15px; color: #374151;"><strong>Tanggal Surat:</strong> {{ \Carbon\Carbon::parse($surat->tanggal_surat)->translatedFormat('d F Y') }}</p>
                                        <p style="margin: 0; font-size: 15px; color: #374151;"><strong>Ditolak Oleh:</strong> {{ $surat->approvedBy->name ?? 'Approver' }}</p>
                                    </td>
                                </tr>
                            </table>

                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 30px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 0 8px 8px 0;">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #991b1b; font-weight: 600;">Catatan Penolakan:</p>
                                        <p style="margin: 0; font-size: 15px; color: #7f1d1d; font-style: italic;">"{{ $catatan }}"</p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 24px; color: #4b5563;">
                                Harap periksa kembali draf surat Anda, lakukan perbaikan sesuai dengan catatan di atas, dan ajukan kembali melalui sistem.
                            </p>

                            <!-- Button -->
                            <div style="text-align: left;">
                                <a href="{{ route('surat.index', ['open' => $surat->id]) }}" style="display: inline-block; padding: 14px 28px; background-color: #ef4444; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);">Lihat Detail & Perbaiki</a>
                            </div>

                            <p style="margin: 30px 0 0 0; font-size: 15px; color: #4b5563; line-height: 24px;">
                                Terima kasih,<br>
                                <strong style="color: #1f2937;">Sistem E-Surat {{ config('app.name') }}</strong>
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Footer -->
                <div style="margin-top: 24px; text-align: center; color: #9ca3af; font-size: 13px; line-height: 20px;">
                    <p style="margin: 0 0 8px 0;">Dikirim oleh Sistem E-Surat PISSYA</p>
                    <p style="margin: 0;">© {{ date('Y') }} Yayasan PISSYA. Hak cipta dilindungi undang-undang.</p>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>