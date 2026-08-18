<?php

namespace App\Mail;

use App\Models\Surat;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SuratDisetujuiMail extends Mailable implements ShouldQueue
{
use Queueable, SerializesModels;

public Surat $surat;

public function __construct(Surat $surat)
{
$this->surat = $surat;
}

public function envelope(): Envelope
{
return new Envelope(
subject: 'Surat Telah Disetujui: ' . $this->surat->nomor_surat_formatted,
);
}

public function content(): Content
{
return new Content(
view: 'emails.surat-disetujui',
);
}
}