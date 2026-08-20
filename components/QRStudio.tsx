'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Wifi,
  Contact,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  MapPin,
  Coins,
  Download,
  Copy,
  Check,
  Sparkles,
  Save,
  Upload,
  RefreshCw,
  Sliders,
  Palette,
  Image as ImageIcon,
  ShieldCheck,
  Code2,
  ExternalLink,
} from 'lucide-react';

interface QRStudioProps {
  user: { name: string; email: string } | null;
  token: string | null;
  onSaved: () => void;
  onOpenAuth: () => void;
}

export function QRStudio({ user, token, onSaved, onOpenAuth }: QRStudioProps) {
  const [type, setType] = useState<string>('url');
  const [title, setTitle] = useState<string>('');

  // Fields
  const [url, setUrl] = useState<string>('https://google.com');
  const [text, setText] = useState<string>('Hello from QR Code Generator API!');
  
  // Wi-Fi fields
  const [wifiSsid, setWifiSsid] = useState<string>('Office_HighSpeed_WiFi');
  const [wifiPass, setWifiPass] = useState<string>('SuperSecretPassword2026');
  const [wifiEnc, setWifiEnc] = useState<string>('WPA');
  const [wifiHidden, setWifiHidden] = useState<boolean>(false);

  // vCard fields
  const [vcFirst, setVcFirst] = useState<string>('Sarah');
  const [vcLast, setVcLast] = useState<string>('Connor');
  const [vcPhone, setVcPhone] = useState<string>('+1 (555) 345-6789');
  const [vcEmail, setVcEmail] = useState<string>('sarah.connor@sky.net');
  const [vcOrg, setVcOrg] = useState<string>('Cyberdyne Systems');
  const [vcTitle, setVcTitle] = useState<string>('Head of Security');
  const [vcWeb, setVcWeb] = useState<string>('https://cyberdyne.io');

  // Email fields
  const [emailTo, setEmailTo] = useState<string>('contact@enterprise.com');
  const [emailSub, setEmailSub] = useState<string>('Partnership Inquiry');
  const [emailBody, setEmailBody] = useState<string>('Hi there, I would love to connect about your API services.');

  // Phone / SMS fields
  const [phoneNumber, setPhoneNumber] = useState<string>('+15551234567');
  const [smsMessage, setSmsMessage] = useState<string>('Hey! Scan completed.');

  // Geo fields
  const [geoLat, setGeoLat] = useState<string>('37.7749');
  const [geoLng, setGeoLng] = useState<string>('-122.4194');

  // Crypto
  const [cryptoAddress, setCryptoAddress] = useState<string>('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
  const [cryptoAmount, setCryptoAmount] = useState<string>('0.005');

  // Customization Options
  const [size, setSize] = useState<number>(350);
  const [margin, setMargin] = useState<number>(4);
  const [ecl, setEcl] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [fgColor, setFgColor] = useState<string>('#0f172a');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [format, setFormat] = useState<'png' | 'svg' | 'dataurl'>('png');
  const [logoUrl, setLogoUrl] = useState<string>('');

  // Result state
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [qrCodeOutput, setQrCodeOutput] = useState<string>('');
  const [formattedContent, setFormattedContent] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Preset Palettes
  const palettes = [
    { name: 'Monochrome', fg: '#0f172a', bg: '#ffffff' },
    { name: 'Indigo Sleek', fg: '#312e81', bg: '#e0e7ff' },
    { name: 'Emerald Clean', fg: '#064e3b', bg: '#d1fae5' },
    { name: 'Midnight', fg: '#f8fafc', bg: '#020617' },
    { name: 'Crimson Bold', fg: '#881337', bg: '#ffe4e6' },
  ];

  // Construct request payload
  const buildPayload = useCallback(() => {
    let payload: any = {
      type,
      title: title || `${type.toUpperCase()} QR Code`,
      options: {
        size,
        margin,
        errorCorrectionLevel: ecl,
        foregroundColor: fgColor,
        backgroundColor: bgColor,
        format,
        logoUrl: logoUrl || undefined,
      },
    };

    if (type === 'url') {
      payload.data = url;
    } else if (type === 'text') {
      payload.data = text;
    } else if (type === 'wifi') {
      payload.ssid = wifiSsid;
      payload.password = wifiPass;
      payload.encryption = wifiEnc;
      payload.hidden = wifiHidden;
    } else if (type === 'vcard') {
      payload.firstName = vcFirst;
      payload.lastName = vcLast;
      payload.phone = vcPhone;
      payload.email = vcEmail;
      payload.company = vcOrg;
      payload.title = vcTitle;
      payload.website = vcWeb;
    } else if (type === 'email') {
      payload.email = emailTo;
      payload.subject = emailSub;
      payload.body = emailBody;
    } else if (type === 'phone') {
      payload.phone = phoneNumber;
    } else if (type === 'sms') {
      payload.phone = phoneNumber;
      payload.message = smsMessage;
    } else if (type === 'geo') {
      payload.latitude = parseFloat(geoLat) || 0;
      payload.longitude = parseFloat(geoLng) || 0;
    } else if (type === 'crypto') {
      payload.address = cryptoAddress;
      payload.amount = cryptoAmount;
    }

    return payload;
  }, [
    type,
    title,
    size,
    margin,
    ecl,
    fgColor,
    bgColor,
    format,
    logoUrl,
    url,
    text,
    wifiSsid,
    wifiPass,
    wifiEnc,
    wifiHidden,
    vcFirst,
    vcLast,
    vcPhone,
    vcEmail,
    vcOrg,
    vcTitle,
    vcWeb,
    emailTo,
    emailSub,
    emailBody,
    phoneNumber,
    smsMessage,
    geoLat,
    geoLng,
    cryptoAddress,
    cryptoAmount,
  ]);

  // Generate QR Code handler
  const generateQRCode = useCallback(async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const payload = buildPayload();
      const res = await fetch('/api/v1/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to generate QR code');
      }

      setQrCodeOutput(data.data.qrCode);
      setFormattedContent(data.data.formattedContent);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Generation error' });
    } finally {
      setLoading(false);
    }
  }, [buildPayload]);

  useEffect(() => {
    let active = true;
    const payload = buildPayload();
    
    fetch('/api/v1/qr/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (active && data.success && data.data) {
          setQrCodeOutput(data.data.qrCode);
          setFormattedContent(data.data.formattedContent);
        }
      })
      .catch((err: any) => {
        if (active) {
          setStatusMessage({ type: 'error', text: err.message || 'Generation error' });
        }
      });

    return () => {
      active = false;
    };
  }, [buildPayload]);

  // Save to History (Authenticated)
  const handleSaveToHistory = async () => {
    if (!token) {
      onOpenAuth();
      return;
    }

    setSaving(true);
    setStatusMessage(null);
    try {
      const payload = buildPayload();
      const res = await fetch('/api/v1/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save QR code');
      }

      setStatusMessage({ type: 'success', text: 'QR code successfully saved to your cloud history!' });
      onSaved();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  // Handle Logo Upload
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch('/api/v1/qr/upload-logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            mimeType: file.type,
            filename: file.name,
          }),
        });
        const data = await res.json();
        if (data.success && data.data?.url) {
          setLogoUrl(data.data.url);
          // Set error correction to High automatically for logo scanning safety
          setEcl('H');
          setStatusMessage({ type: 'success', text: 'Logo processed and embedded with Level-H error correction.' });
        } else {
          throw new Error(data.message || 'Logo upload failed');
        }
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: err.message });
      }
    };
    reader.readAsDataURL(file);
  };

  // Copy output
  const handleCopy = () => {
    navigator.clipboard.writeText(qrCodeOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Output
  const handleDownload = () => {
    const link = document.createElement('a');
    if (format === 'svg') {
      const blob = new Blob([qrCodeOutput], { type: 'image/svg+xml' });
      link.href = URL.createObjectURL(blob);
      link.download = `qrcode-${type}-${Date.now()}.svg`;
    } else {
      link.href = qrCodeOutput;
      link.download = `qrcode-${type}-${Date.now()}.png`;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const typesList = [
    { id: 'url', label: 'URL / Link', icon: Globe },
    { id: 'wifi', label: 'Wi-Fi Network', icon: Wifi },
    { id: 'vcard', label: 'vCard Contact', icon: Contact },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'phone', label: 'Phone Call', icon: Phone },
    { id: 'sms', label: 'SMS Message', icon: MessageSquare },
    { id: 'text', label: 'Plain Text', icon: FileText },
    { id: 'geo', label: 'Geo Coordinates', icon: MapPin },
    { id: 'crypto', label: 'Crypto Address', icon: Coins },
  ];

  return (
    <div id="qr-studio-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
      {/* Left Control Panel: Type Selector & Content Inputs (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Type Selector Bar */}
        <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-5 shadow-sm">
          <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">
            Select QR Content Protocol
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {typesList.map((t) => {
              const Icon = t.icon;
              const isSelected = type === t.id;
              return (
                <button
                  key={t.id}
                  id={`qr-type-btn-${t.id}`}
                  onClick={() => setType(t.id)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.25)]'
                      : 'bg-[#080A0E] border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="text-[11px] truncate w-full text-center">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Form Inputs */}
        <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span>{typesList.find((t) => t.id === type)?.label} Payload Configuration</span>
            </h3>
            <input
              type="text"
              placeholder="Tag / Label for History"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#080A0E] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* URL Input */}
          {type === 'url' && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Target Web URL</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  id="input-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Plain Text Input */}
          {type === 'text' && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Arbitrary Text Content</label>
              <textarea
                id="input-text"
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter raw text, JSON, or markdown..."
                className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          )}

          {/* Wi-Fi Inputs */}
          {type === 'wifi' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Network Name (SSID)</label>
                <input
                  id="input-wifi-ssid"
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="MyHomeWiFi"
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
                <input
                  id="input-wifi-pass"
                  type="text"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  placeholder="Password (leave empty if open)"
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Encryption Protocol</label>
                <select
                  id="input-wifi-enc"
                  value={wifiEnc}
                  onChange={(e) => setWifiEnc(e.target.value)}
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                  <option value="WEP">WEP (Legacy)</option>
                  <option value="nopass">None (Open Network)</option>
                </select>
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wifiHidden}
                    onChange={(e) => setWifiHidden(e.target.checked)}
                    className="rounded bg-[#080A0E] border-white/10 text-indigo-600 focus:ring-0"
                  />
                  <span>Hidden Network (SSID not broadcast)</span>
                </label>
              </div>
            </div>
          )}

          {/* vCard Inputs */}
          {type === 'vcard' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={vcFirst}
                  onChange={(e) => setVcFirst(e.target.value)}
                  placeholder="John"
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={vcLast}
                  onChange={(e) => setVcLast(e.target.value)}
                  placeholder="Doe"
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={vcPhone}
                  onChange={(e) => setVcPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={vcEmail}
                  onChange={(e) => setVcEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Company</label>
                <input
                  type="text"
                  value={vcOrg}
                  onChange={(e) => setVcOrg(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Job Title</label>
                <input
                  type="text"
                  value={vcTitle}
                  onChange={(e) => setVcTitle(e.target.value)}
                  placeholder="Lead Engineer"
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Website URL</label>
                <input
                  type="url"
                  value={vcWeb}
                  onChange={(e) => setVcWeb(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email Inputs */}
          {type === 'email' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Recipient Email</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="hello@example.com"
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Subject</label>
                <input
                  type="text"
                  value={emailSub}
                  onChange={(e) => setEmailSub(e.target.value)}
                  placeholder="Email Subject"
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Body Text</label>
                <textarea
                  rows={2}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Prefilled email body..."
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Phone Inputs */}
          {type === 'phone' && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Phone Number to Call</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* SMS Inputs */}
          {type === 'sms' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Recipient Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+15551234567"
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Prefilled SMS Message</label>
                <textarea
                  rows={2}
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="Enter message text..."
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Geo Coordinates */}
          {type === 'geo' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Latitude</label>
                <input
                  type="text"
                  value={geoLat}
                  onChange={(e) => setGeoLat(e.target.value)}
                  placeholder="37.7749"
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Longitude</label>
                <input
                  type="text"
                  value={geoLng}
                  onChange={(e) => setGeoLng(e.target.value)}
                  placeholder="-122.4194"
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Crypto */}
          {type === 'crypto' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Bitcoin / Crypto Wallet Address</label>
                <input
                  type="text"
                  value={cryptoAddress}
                  onChange={(e) => setCryptoAddress(e.target.value)}
                  placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Amount (BTC)</label>
                <input
                  type="text"
                  value={cryptoAmount}
                  onChange={(e) => setCryptoAmount(e.target.value)}
                  placeholder="0.01"
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {/* Customization Controls */}
        <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Design & Customization Engine</span>
            </h3>
            {/* Quick Palettes */}
            <div className="flex items-center gap-1.5">
              {palettes.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => { setFgColor(p.fg); setBgColor(p.bg); }}
                  className="w-5 h-5 rounded-full border border-white/15 hover:scale-110 transition-transform overflow-hidden flex cursor-pointer"
                  title={`Palette: ${p.name}`}
                >
                  <span className="w-1/2 h-full" style={{ backgroundColor: p.fg }}></span>
                  <span className="w-1/2 h-full" style={{ backgroundColor: p.bg }}></span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Colors */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span>Foreground Color</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white uppercase font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span>Background Color</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor === 'transparent' ? '#ffffff' : bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white uppercase font-mono"
                />
              </div>
            </div>

            {/* Error Correction & Format */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Error Correction</span>
              </label>
              <select
                value={ecl}
                onChange={(e) => setEcl(e.target.value as any)}
                className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="L">Level L (~7% recovery - cleanest)</option>
                <option value="M">Level M (~15% recovery - standard)</option>
                <option value="Q">Level Q (~25% recovery - high)</option>
                <option value="H">Level H (~30% recovery - best for logos)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Output Format</label>
              <div className="grid grid-cols-3 gap-1.5 bg-[#080A0E] p-1 rounded-xl border border-white/10">
                {(['png', 'svg', 'dataurl'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    className={`py-1.5 rounded-lg text-xs uppercase font-bold transition-all cursor-pointer ${
                      format === fmt ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Size & Margin Sliders */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">Resolution / Dimension</span>
                <span className="text-indigo-400 font-mono">{size}px</span>
              </div>
              <input
                type="range"
                min={150}
                max={1000}
                step={25}
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">Quiet Zone (Margin)</span>
                <span className="text-indigo-400 font-mono">{margin} blocks</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          {/* Logo Upload Section */}
          <div className="pt-3 border-t border-white/5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Center Logo Overlay (Auto-enforces Level H Error Correction)</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 bg-[#080A0E] hover:bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold px-3.5 py-2 rounded-xl cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Upload Logo (PNG, SVG, WebP)</span>
                <input type="file" accept="image/*" onChange={handleLogoFileUpload} className="hidden" />
              </label>

              {logoUrl && (
                <div className="flex items-center gap-2 bg-[#080A0E] border border-white/10 px-3 py-1.5 rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt="Logo" className="w-5 h-5 object-contain rounded" />
                  <span className="text-xs text-emerald-400 font-medium">Embedded</span>
                  <button
                    onClick={() => setLogoUrl('')}
                    className="text-slate-500 hover:text-rose-400 text-xs ml-1 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Result Preview & Actions Panel (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center sticky top-24">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Real-Time Matrix Output</span>
            </span>
            <span className="text-[11px] font-mono bg-white/5 border border-white/10 text-indigo-300 px-2 py-0.5 rounded uppercase">
              {format}
            </span>
          </div>

          {/* QR Render Window */}
          <div
            id="qr-preview-box"
            className="w-full aspect-square max-w-[320px] rounded-2xl border border-white/10 flex items-center justify-center p-4 relative shadow-inner overflow-hidden"
            style={{ backgroundColor: bgColor === 'transparent' ? '#0F1115' : bgColor }}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                <span className="text-xs font-medium">Generating QR Matrix...</span>
              </div>
            ) : qrCodeOutput ? (
              format === 'svg' ? (
                <div
                  className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: qrCodeOutput }}
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={qrCodeOutput}
                  alt="Generated QR Code"
                  className="w-full h-full object-contain"
                />
              )
            ) : (
              <span className="text-xs text-slate-500">Awaiting payload...</span>
            )}
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`w-full mt-4 p-2.5 rounded-xl text-xs font-medium text-center ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full grid grid-cols-2 gap-2.5 mt-5">
            <button
              id="download-qr-btn"
              onClick={handleDownload}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download {format.toUpperCase()}</span>
            </button>

            <button
              id="copy-qr-btn"
              onClick={handleCopy}
              className="w-full bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold py-2.5 rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Data'}</span>
            </button>
          </div>

          {/* Save to History Button */}
          <div className="w-full mt-3">
            <button
              id="save-qr-history-btn"
              onClick={handleSaveToHistory}
              disabled={saving}
              className={`w-full text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                user
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>
                {saving
                  ? 'Saving to Cloud...'
                  : user
                  ? 'Save to Cloud History (POST /api/v1/qr)'
                  : 'Sign In to Save to History'}
              </span>
            </button>
          </div>

          {/* Raw Protocol Payload Preview */}
          <div className="w-full mt-5 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-semibold flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] font-mono">Encoded QR Payload</span>
              </span>
            </div>
            <div className="bg-[#080A0E] p-2.5 rounded-xl border border-white/10 text-[11px] font-mono text-slate-300 break-all max-h-24 overflow-y-auto">
              {formattedContent || 'Payload string'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
