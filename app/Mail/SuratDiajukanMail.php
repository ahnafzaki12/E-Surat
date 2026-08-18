<?php

namespace App\Mail;

use App\Models\Surat;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SuratDiajukanMail extends Mailable implements ShouldQueue
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
subject: 'Pengajuan Surat Baru Menunggu Persetujuan: ' . $this->surat->perihal,
);
}

public function content(): Content
{
return new Content(
view: 'emails.surat-diajukan',
);
}
}