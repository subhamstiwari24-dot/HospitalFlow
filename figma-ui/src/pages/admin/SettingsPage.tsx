import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import { SkAdminDashboard } from '../../components/Skeleton';
import { AdminApiError, changeAdminPassword, getAdminSettings, updateAdminProfile, updateAdminSettings } from '../../services/adminApi';
import type { AdminSettings } from '../../types/admin';
import { useAdminAuth } from '../../context/AdminAuthContext';

const emptySettings: AdminSettings = {
  hospital: { id: 0, name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', description: '', emergencyAvailable: false, active: true },
  opdStartTime: '09:00 AM', opdEndTime: '05:00 PM', bookingEnabled: true, sameDayBookingEnabled: true, cancellationEnabled: true, defaultSlotCapacity: 10, consultationDurationMinutes: 30, onlinePaymentConfigured: false, notificationsSupported: false,
};

export default function SettingsPage() {
  const { admin } = useAdminAuth();
  const [settings, setSettings] = useState<AdminSettings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profile, setProfile] = useState({ fullName: '', email: '' });

  useEffect(() => {
    const controller = new AbortController();
    getAdminSettings(controller.signal).then(setSettings).catch((loadError) => {
      setError(loadError instanceof AdminApiError && loadError.status === 403 ? 'You are not authorized to view settings.' : 'Unable to load settings.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (admin) setProfile({ fullName: admin.fullName, email: admin.email });
  }, [admin]);

  const updateHospital = (field: keyof AdminSettings['hospital'], value: string | boolean) => setSettings((current) => ({ ...current, hospital: { ...current.hospital, [field]: value } }));
  const saveSettings = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage(''); setError('');
    if (!settings.hospital.name.trim() || !settings.opdStartTime || !settings.opdEndTime || settings.defaultSlotCapacity <= 0 || settings.consultationDurationMinutes <= 0) { setError('Complete the required fields with valid values.'); setSaving(false); return; }
    try { setSettings(await updateAdminSettings(settings)); setMessage('Settings saved successfully.'); } catch { setError('Unable to save settings. Check the values and try again.'); } finally { setSaving(false); }
  };
  const saveProfile = async (event: React.FormEvent) => { event.preventDefault(); setSaving(true); setMessage(''); setError(''); try { await updateAdminProfile(profile.fullName, profile.email); setMessage('Admin profile updated successfully.'); } catch { setError('Unable to update admin profile.'); } finally { setSaving(false); } };
  const changePassword = async (event: React.FormEvent) => { event.preventDefault(); setSaving(true); setMessage(''); setError(''); try { await changeAdminPassword(passwords.currentPassword, passwords.newPassword, passwords.confirmPassword); setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); setMessage('Password changed successfully.'); } catch { setError('Unable to change password. Check the current password and confirmation.'); } finally { setSaving(false); } };
  const inputClass = 'w-full bg-white border border-[#d8e1ec] rounded-[9px] px-[12px] py-[10px] text-[13px] text-[#142033] outline-none focus:border-[#155ead]';
  const field = (label: string, value: string, onChange: (value: string) => void, type = 'text') => <label className="flex flex-col gap-1 text-[12px] font-semibold text-[#526176]"><span>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} /></label>;

  if (loading) return <AdminLayout title="Settings"><SkAdminDashboard /></AdminLayout>;
  return <AdminLayout title="Settings">
    <div className="mb-6"><h1 className="font-bold text-[#142033] text-[24px]">Settings</h1><p className="text-[#526176] text-[14px] mt-1">Manage persisted HospitalFlow operations and administrator access.</p></div>
    {message && <div className="mb-4 rounded-[10px] border border-[#b9e5d0] bg-[#e8f7f1] px-4 py-3 text-[13px] text-[#18865b]">{message}</div>}
    {error && <div className="mb-4 rounded-[10px] border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-[13px] text-[#c53a45]">{error}</div>}
    <form onSubmit={saveSettings} className="space-y-4">
      <section className="bg-white border border-[#d8e1ec] rounded-[14px] p-5"><h2 className="font-bold text-[#142033] text-[16px] mb-4">Hospital Profile</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{field('Hospital name', settings.hospital.name, (value) => updateHospital('name', value))}{field('Email', settings.hospital.email, (value) => updateHospital('email', value), 'email')}{field('Phone', settings.hospital.phone, (value) => updateHospital('phone', value))}{field('Address', settings.hospital.address, (value) => updateHospital('address', value))}{field('City', settings.hospital.city, (value) => updateHospital('city', value))}{field('State', settings.hospital.state, (value) => updateHospital('state', value))}{field('Pincode', settings.hospital.pincode, (value) => updateHospital('pincode', value))}{field('Description', settings.hospital.description, (value) => updateHospital('description', value))}</div><label className="mt-4 flex items-center gap-2 text-[13px] text-[#526176]"><input type="checkbox" checked={settings.hospital.emergencyAvailable} onChange={(event) => updateHospital('emergencyAvailable', event.target.checked)} /> Emergency availability</label></section>
      <section className="bg-white border border-[#d8e1ec] rounded-[14px] p-5"><h2 className="font-bold text-[#142033] text-[16px] mb-4">OPD & Appointment Settings</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{field('OPD start time', settings.opdStartTime, (value) => setSettings({ ...settings, opdStartTime: value }))}{field('OPD end time', settings.opdEndTime, (value) => setSettings({ ...settings, opdEndTime: value }))}</div><div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">{(['bookingEnabled', 'sameDayBookingEnabled', 'cancellationEnabled'] as const).map((name) => <label key={name} className="flex items-center gap-2 text-[13px] text-[#526176]"><input type="checkbox" checked={settings[name]} onChange={(event) => setSettings({ ...settings, [name]: event.target.checked })} /> {name === 'bookingEnabled' ? 'Booking enabled' : name === 'sameDayBookingEnabled' ? 'Same-day booking' : 'Cancellation enabled'}</label>)}</div></section>
      <section className="bg-white border border-[#d8e1ec] rounded-[14px] p-5"><h2 className="font-bold text-[#142033] text-[16px] mb-4">Slot & Queue Settings</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{field('Default slot capacity', String(settings.defaultSlotCapacity), (value) => setSettings({ ...settings, defaultSlotCapacity: Number(value) }), 'number')}{field('Consultation duration (minutes)', String(settings.consultationDurationMinutes), (value) => setSettings({ ...settings, consultationDurationMinutes: Number(value) }), 'number')}</div></section>
      <section className="bg-white border border-[#d8e1ec] rounded-[14px] p-5"><h2 className="font-bold text-[#142033] text-[16px] mb-3">Notifications & Payments</h2><p className="text-[13px] text-[#526176]">Persistent notification preferences are not supported by the current backend.</p><p className="mt-2 text-[13px] text-[#526176]">Online payment configuration: <strong>{settings.onlinePaymentConfigured ? 'Configured' : 'Not configured'}</strong>. Secret values are never exposed.</p></section>
      <Button type="submit" variant="primary" loading={saving}>Save Changes</Button>
    </form>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      <form onSubmit={saveProfile} className="bg-white border border-[#d8e1ec] rounded-[14px] p-5"><h2 className="font-bold text-[#142033] text-[16px] mb-4">Admin Profile</h2><div className="space-y-3">{field('Full name', profile.fullName, (value) => setProfile({ ...profile, fullName: value }))}{field('Employee ID', admin?.employeeId ?? '', () => {})}{field('Email', profile.email, (value) => setProfile({ ...profile, email: value }), 'email')}</div><p className="text-[12px] text-[#526176] mt-3">Role: {admin?.role} · Account: {admin?.active ? 'Active' : 'Inactive'}</p><Button type="submit" variant="secondary" loading={saving} className="mt-4">Save Profile</Button></form>
      <form onSubmit={changePassword} className="bg-white border border-[#d8e1ec] rounded-[14px] p-5"><h2 className="font-bold text-[#142033] text-[16px] mb-4">Security</h2><div className="space-y-3">{field('Current password', passwords.currentPassword, (value) => setPasswords({ ...passwords, currentPassword: value }), 'password')}{field('New password', passwords.newPassword, (value) => setPasswords({ ...passwords, newPassword: value }), 'password')}{field('Confirm new password', passwords.confirmPassword, (value) => setPasswords({ ...passwords, confirmPassword: value }), 'password')}</div><Button type="submit" variant="secondary" loading={saving} className="mt-4">Change Password</Button></form>
    </div>
  </AdminLayout>;
}