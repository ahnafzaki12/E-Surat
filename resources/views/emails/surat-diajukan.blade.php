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
                        <td style="background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%); padding: 40px 20px; text-align: center;">
                            <h2 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 800; letter-spacing: 0.5px;">Pengajuan Baru</h2>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #1f2937;">
                                Halo <strong>Bapak/Ibu Approver</strong>,
                            </p>
                            <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #4b5563;">
                                Terdapat pengajuan surat baru yang memerlukan persetujuan Anda segera. Berikut adalah rincian surat tersebut:
                            </p>

                            <!-- Details -->
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 30px; background-color: #f3f4f6; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 10px 0; font-size: 15px; color: #374151;"><strong>Perihal:</strong> {{ $surat->perihal }}</p>
                                        <p style="margin: 0 0 10px 0; font-size: 15px; color: #374151;"><strong>Tujuan Surat:</strong> {{ $surat->tujuan_surat }}</p>
                                        <p style="margin: 0 0 10px 0; font-size: 15px; color: #374151;"><strong>Tanggal Surat:</strong> {{ \Carbon\Carbon::parse($surat->tanggal_surat)->translatedFormat('d F Y') }}</p>
                                        <p style="margin: 0; font-size: 15px; color: #374151;"><strong>Diajukan Oleh:</strong> {{ $surat->createdBy->name ?? '-' }}</p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 24px; color: #4b5563;">
                                Silakan tinjau dokumen ini melalui sistem E-Surat untuk memberikan persetujuan atau penolakan.
                            </p>

                            <!-- Button -->
                            <div style="text-align: left;">
                                <a href="{{ route('surat.index', ['open' => $surat->id]) }}" style="display: inline-block; padding: 14px 28px; background-color: #6366f1; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);">Periksa Surat Sekarang</a>
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