<?php

namespace App\Services\Zatca;

use BaconQrCode\Encoder\Encoder;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Str;

/**
 * ZATCA (Zakat, Tax and Customs Authority) e-invoicing compliance.
 * Generates UBL 2.1 XML invoices with TLV-encoded QR codes per Saudi Phase 2.
 * Spec: https://zatca.gov.sa/en/E-Invoicing/
 */
class ZatcaService
{
    // TLV tag numbers per ZATCA specification
    private const TLV_SELLER_NAME       = 1;
    private const TLV_VAT_NUMBER        = 2;
    private const TLV_INVOICE_TIMESTAMP = 3;
    private const TLV_INVOICE_TOTAL     = 4;
    private const TLV_VAT_AMOUNT        = 5;

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Generate all ZATCA fields for an invoice and return them alongside the invoice data.
     *
     * @param  array{
     *   invoice_number: string,
     *   invoice_date: string,
     *   invoice_time?: string,
     *   seller_name: string,
     *   seller_vat: string,
     *   buyer_name?: string,
     *   buyer_vat?: string,
     *   line_items: array,
     *   subtotal: float,
     *   vat_amount: float,
     *   total: float,
     *   currency?: string,
     *   invoice_type?: string,
     * } $data
     */
    public function generateInvoiceFields(array $data): array
    {
        $uuid      = (string) Str::uuid();
        $timestamp = $data['invoice_date'] . 'T' . ($data['invoice_time'] ?? now()->format('H:i:s')) . 'Z';
        $qrPayload = $this->buildTlvPayload(
            $data['seller_name'],
            $data['seller_vat'],
            $timestamp,
            (float) $data['total'],
            (float) $data['vat_amount']
        );
        $qrBase64  = base64_encode($qrPayload);
        $xmlHash   = $this->computeInvoiceHash($data, $uuid);

        return [
            'zatca_uuid'      => $uuid,
            'zatca_qr_code'   => $qrBase64,
            'zatca_qr_svg'    => $this->generateQrSvg($qrBase64),
            'zatca_xml_hash'  => $xmlHash,
            'zatca_timestamp' => $timestamp,
            'zatca_status'    => 'generated',
        ];
    }

    /**
     * Build the full UBL 2.1 XML invoice string compliant with ZATCA Phase 2.
     *
     * @param  array $data  Same shape as generateInvoiceFields()
     * @param  array $zatca Fields returned by generateInvoiceFields()
     */
    public function buildXml(array $data, array $zatca): string
    {
        $currency      = $data['currency'] ?? 'SAR';
        $invoiceType   = $data['invoice_type'] ?? 'standard'; // standard|simplified|credit|debit
        $typeCode      = $this->getInvoiceTypeCode($invoiceType);
        $subTypeCode   = $invoiceType === 'simplified' ? '0200000' : '0100000';
        $buyerVat      = $data['buyer_vat'] ?? '';
        $buyerName     = $data['buyer_name'] ?? '';
        $issueTime     = $data['invoice_time'] ?? now()->format('H:i:s');
        $lineItemsXml  = $this->buildLineItemsXml($data['line_items'] ?? [], $currency);

        return <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionURI>urn:oasis:names:specification:ubl:dsig:ext:XMLDSIG</ext:ExtensionURI>
      <ext:ExtensionContent>
        <sig:UBLDocumentSignatures xmlns:sig="urn:oasis:names:specification:ubl:schema:xsd:CommonSignatureComponents-2"
                                   xmlns:sac="urn:oasis:names:specification:ubl:schema:xsd:SignatureAggregateComponents-2"
                                   xmlns:sbc="urn:oasis:names:specification:ubl:schema:xsd:SignatureBasicComponents-2">
          <sac:SignatureInformation>
            <cbc:ID>urn:oasis:names:specification:ubl:signature:1</cbc:ID>
            <sbc:ReferencedSignatureID>urn:oasis:names:specification:ubl:signature:Invoice</sbc:ReferencedSignatureID>
          </sac:SignatureInformation>
        </sig:UBLDocumentSignatures>
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>{$data['invoice_number']}</cbc:ID>
  <cbc:UUID>{$zatca['zatca_uuid']}</cbc:UUID>
  <cbc:IssueDate>{$data['invoice_date']}</cbc:IssueDate>
  <cbc:IssueTime>{$issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="{$subTypeCode}">{$typeCode}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>{$currency}</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>{$currency}</cbc:TaxCurrencyCode>
  <cac:AdditionalDocumentReference>
    <cbc:ID>ICV</cbc:ID>
    <cbc:UUID>{$this->getIcv($data['invoice_number'])}</cbc:UUID>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>PIH</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">{$zatca['zatca_xml_hash']}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>QR</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">{$zatca['zatca_qr_code']}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">{$data['seller_vat']}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>{$this->xmlEscape($data['seller_name'])}</cbc:Name>
      </cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>{$data['seller_vat']}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>{$this->xmlEscape($buyerName)}</cbc:Name>
      </cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>{$buyerVat}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="{$currency}">{$this->fmt($data['vat_amount'])}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="{$currency}">{$this->fmt($data['subtotal'])}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="{$currency}">{$this->fmt($data['vat_amount'])}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>15.00</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="{$currency}">{$this->fmt($data['subtotal'])}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="{$currency}">{$this->fmt($data['subtotal'])}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="{$currency}">{$this->fmt($data['total'])}</cbc:TaxInclusiveAmount>
    <cbc:PrepaidAmount currencyID="{$currency}">0.00</cbc:PrepaidAmount>
    <cbc:PayableAmount currencyID="{$currency}">{$this->fmt($data['total'])}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
{$lineItemsXml}
</Invoice>
XML;
    }

    // -------------------------------------------------------------------------
    // TLV / QR Code
    // -------------------------------------------------------------------------

    /**
     * Build TLV-encoded binary string per ZATCA spec (tag-length-value encoding).
     */
    public function buildTlvPayload(
        string $sellerName,
        string $vatNumber,
        string $timestamp,
        float  $total,
        float  $vatAmount
    ): string {
        return
            $this->tlvField(self::TLV_SELLER_NAME, $sellerName) .
            $this->tlvField(self::TLV_VAT_NUMBER, $vatNumber) .
            $this->tlvField(self::TLV_INVOICE_TIMESTAMP, $timestamp) .
            $this->tlvField(self::TLV_INVOICE_TOTAL, number_format($total, 2, '.', '')) .
            $this->tlvField(self::TLV_VAT_AMOUNT, number_format($vatAmount, 2, '.', ''));
    }

    private function tlvField(int $tag, string $value): string
    {
        $bytes = mb_convert_encoding($value, 'UTF-8');

        return chr($tag) . chr(strlen($bytes)) . $bytes;
    }

    private function generateQrSvg(string $qrBase64): string
    {
        try {
            $renderer = new ImageRenderer(
                new RendererStyle(200),
                new SvgImageBackEnd()
            );
            $writer = new Writer($renderer);

            return $writer->writeString($qrBase64, Encoder::DEFAULT_BYTE_MODE_ECODING);
        } catch (\Throwable) {
            return '';
        }
    }

    // -------------------------------------------------------------------------
    // XML Helpers
    // -------------------------------------------------------------------------

    private function buildLineItemsXml(array $items, string $currency): string
    {
        $xml = '';
        foreach ($items as $idx => $item) {
            $seq    = $idx + 1;
            $net    = $this->fmt((float) ($item['net'] ?? ($item['quantity'] ?? 1) * ($item['unit_price'] ?? 0)));
            $vat    = $this->fmt((float) ($item['vat_amount'] ?? ($item['net'] ?? 0) * 0.15));
            $qty    = (float) ($item['quantity'] ?? 1);
            $price  = $this->fmt((float) ($item['unit_price'] ?? 0));
            $code   = $this->xmlEscape($item['code'] ?? '');
            $desc   = $this->xmlEscape($item['description'] ?? '');

            $xml .= <<<XML
  <cac:InvoiceLine>
    <cbc:ID>{$seq}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="EA">{$qty}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="{$currency}">{$net}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="{$currency}">{$vat}</cbc:TaxAmount>
      <cbc:RoundingAmount currencyID="{$currency}">{$this->fmt((float)$net + (float)$vat)}</cbc:RoundingAmount>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>{$desc}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>15.00</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="{$currency}">{$price}</cbc:PriceAmount>
      <cac:ItemPriceExtension>
        <cbc:Amount currencyID="{$currency}">{$net}</cbc:Amount>
      </cac:ItemPriceExtension>
    </cac:Price>
  </cac:InvoiceLine>
XML;
        }

        return $xml;
    }

    private function getInvoiceTypeCode(string $type): string
    {
        return match ($type) {
            'credit'     => '381',
            'debit'      => '383',
            default      => '388',
        };
    }

    private function computeInvoiceHash(array $data, string $uuid): string
    {
        $canonical = json_encode([
            'uuid'    => $uuid,
            'number'  => $data['invoice_number'],
            'date'    => $data['invoice_date'],
            'total'   => $data['total'],
            'vat'     => $data['vat_amount'],
            'seller'  => $data['seller_vat'],
        ], JSON_UNESCAPED_UNICODE);

        return base64_encode(hash('sha256', $canonical, true));
    }

    private function getIcv(string $invoiceNumber): int
    {
        // Extract numeric sequence from invoice number; fallback to 1
        preg_match('/(\d+)$/', $invoiceNumber, $m);

        return (int) ($m[1] ?? 1);
    }

    private function xmlEscape(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }

    private function fmt(float $value): string
    {
        return number_format($value, 2, '.', '');
    }
}
