import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ClipboardCheck,
    AlertCircle,
    ShieldCheck,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Heart,
    Camera,
    ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const MembershipForm = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        membershipType: '',
        forename: '',
        surname: '',
        gender: '',
        dob: '',
        birthPlace: '',
        appType: 'New Member',
        email: '',
        phone1: '',
        phone2: '',
        addressLine1: '',
        addressLine2: '',
        town: '',
        postcode: '',
        eaStatus: 'No',
        medicalInfo: '',
        medicalConsent: false,
        emergencyName1: '',
        emergencyPhone1: '',
        emergencyName2: '',
        emergencyPhone2: '',
        volunteering: [],
        photoConsent: false,
        marketingConsent: true,
        declaration: false
    });

    const totalSteps = 5;

    const nextStep = () => {
        // Simple validation for required fields in Step 1
        if (step === 1 && !formData.membershipType) {
            alert('Please select a membership category');
            return;
        }
        setStep(s => Math.min(s + 1, totalSteps));
    };

    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleStepClick = (s) => {
        if (s < step) setStep(s);
    };

    const steps = [
        { id: 1, title: 'Category', icon: ClipboardCheck },
        { id: 2, title: 'Personal', icon: User },
        { id: 3, title: 'Contact', icon: Mail },
        { id: 4, title: 'Medical', icon: Heart },
        { id: 5, title: 'Consents', icon: ShieldCheck }
    ];

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-emerald-800 text-sm">
                            <p className="font-bold flex items-center gap-2 mb-1">
                                <AlertCircle size={16} /> Important for Under 18s
                            </p>
                            Do not purchase membership until you have been advised by your training group coach to do so.
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-700">Select Membership Category</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { id: 'full', label: 'Full Member (over 21)', price: '£49.00' },
                                    { id: 'student', label: 'Student (over 18)', price: '£34.00' },
                                    { id: 'family', label: 'Family (2 adults + kids)', price: '£84.00' },
                                    { id: 'senior', label: 'Senior Citizen (over 65)', price: '£24.00' },
                                    { id: 'he_student', label: 'HE Student (living away)', price: '£24.00' },
                                    { id: 'social', label: 'Non-Competing / Social', price: '£24.00' }
                                ].map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, membershipType: cat.id }))}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left group",
                                            formData.membershipType === cat.id
                                                ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20"
                                                : "border-slate-100 hover:border-slate-200 bg-white"
                                        )}
                                    >
                                        <div>
                                            <p className="font-bold text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors uppercase text-xs tracking-wider">{cat.label}</p>
                                            <p className="text-[10px] text-slate-500 mt-1 uppercase">Annual Fee</p>
                                        </div>
                                        <div className="text-emerald-600 font-black tracking-tight">{cat.price}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-slate-700">Application Type</label>
                            <div className="flex gap-4">
                                {['New Member', 'Renewing', 'Past Member'].map(type => (
                                    <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="appType"
                                            value={type}
                                            checked={formData.appType === type}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-widest">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1">
                                    <User size={12} /> Forename(s)
                                </label>
                                <input
                                    name="forename"
                                    value={formData.forename}
                                    onChange={handleInputChange}
                                    placeholder="Enter your first name"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50/50 font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1">
                                    <User size={12} /> Surname
                                </label>
                                <input
                                    name="surname"
                                    value={formData.surname}
                                    onChange={handleInputChange}
                                    placeholder="Enter your last name"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50/50 font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1">
                                    <Calendar size={12} /> Date of Birth
                                </label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Gender</label>
                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    {['Male', 'Female', 'Non-Binary'].map(g => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, gender: g }))}
                                            className={cn(
                                                "flex-1 py-1.5 text-[10px] font-black uppercase rounded-md transition-all tracking-wider",
                                                formData.gender === g ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Place of Birth (for County Affiliation)</label>
                                <input
                                    name="birthPlace"
                                    value={formData.birthPlace}
                                    onChange={handleInputChange}
                                    placeholder="City, Country"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50/50 font-medium"
                                />
                            </div>
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">Electronic Contact</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Mail size={12} /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="your.name@example.com"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50/50 font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Phone size={12} /> Telephone
                                    </label>
                                    <input
                                        name="phone1"
                                        value={formData.phone1}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50/50 font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Phone size={12} /> Secondary
                                    </label>
                                    <input
                                        name="phone2"
                                        value={formData.phone2}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50/50 font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] border-b border-slate-100 pb-2 flex items-center gap-2">
                                <MapPin size={18} className="text-slate-300" />
                                Home Address
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="md:col-span-2 space-y-2">
                                    <input placeholder="Address Line 1" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 font-medium" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <input placeholder="Address Line 2 (Optional)" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <input placeholder="Town/City" name="town" value={formData.town} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <input placeholder="Postcode" name="postcode" value={formData.postcode} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 font-medium" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] border-b border-slate-100 pb-2 flex items-center gap-2">
                                <Heart size={18} className="text-red-500" />
                                Medical Details
                            </h3>
                            <div className="space-y-3">
                                <p className="text-[10px] text-slate-400 leading-relaxed italic uppercase font-bold">
                                    Confidential Disability or Medical information
                                </p>
                                <textarea
                                    name="medicalInfo"
                                    value={formData.medicalInfo}
                                    onChange={handleInputChange}
                                    placeholder="Enter details here..."
                                    className="w-full h-32 px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 resize-none text-sm font-medium"
                                />
                                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 cursor-pointer transition-colors group">
                                    <input
                                        type="checkbox"
                                        name="medicalConsent"
                                        checked={formData.medicalConsent}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                                    />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                                        Consent to share details with relevant club officials
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">Emergency Contacts</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2].map(num => (
                                    <div key={num} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none">Contact {num}</p>
                                        <div className="space-y-1">
                                            <input
                                                placeholder="Full Name"
                                                name={num === 1 ? "emergencyName1" : "emergencyName2"}
                                                value={num === 1 ? formData.emergencyName1 : formData.emergencyName2}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <input
                                                placeholder="Phone Number"
                                                name={num === 1 ? "emergencyPhone1" : "emergencyPhone2"}
                                                value={num === 1 ? formData.emergencyPhone1 : formData.emergencyPhone2}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                );
            case 5:
                return (
                    <motion.div
                        key="step5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">Consents & Legal</h3>

                            <div className="space-y-3">
                                <label className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                    <input type="checkbox" name="marketingConsent" checked={formData.marketingConsent} onChange={handleInputChange} className="mt-1 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" />
                                    <div>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">Marketing Permission</p>
                                        <p className="text-[10px] text-slate-500 font-medium">I consent to receiving club emails, newsletters and event notifications.</p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                    <input type="checkbox" name="photoConsent" checked={formData.photoConsent} onChange={handleInputChange} className="mt-1 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Camera size={14} className="text-slate-300" />
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">Adult Photography</p>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium italic">I consent to having my image used in club publications and social media for adults.</p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl cursor-pointer group">
                                    <input type="checkbox" name="declaration" checked={formData.declaration} onChange={handleInputChange} className="mt-1 w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500" />
                                    <div>
                                        <p className="text-xs font-black text-white uppercase tracking-[0.2em] mb-1">Amateur Status Declaration</p>
                                        <p className="text-[9px] text-slate-400 font-medium leading-relaxed uppercase tracking-wider">
                                            I declare I am an amateur. I agree to UKA/EA rules. I understand membership is subject to committee approval. Details checked.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="bg-emerald-600 rounded-3xl p-6 text-white text-center shadow-2xl shadow-emerald-500/20">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <ShieldCheck size={24} />
                                <span className="text-lg font-black uppercase tracking-[0.2em]">Secure Entry</span>
                            </div>
                            <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest opacity-80">Final Review before Payment</p>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans overflow-x-hidden">
            <div className="max-w-xl mx-auto">
                <div className="text-center mb-10">
                    <img
                        src="/logo.png"
                        alt="HAC Logo"
                        className="h-12 w-auto mx-auto mb-6 brightness-0 opacity-80"
                    />
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Club Registration</h1>
                    <div className="h-1 w-12 bg-emerald-500 mx-auto mt-4 rounded-full" />
                </div>

                {/* Stepper */}
                <div className="mb-12 relative flex justify-between px-2">
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200 -translate-y-1/2 z-0" />
                    <div
                        className="absolute top-1/2 left-0 h-[2px] bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-700 ease-out"
                        style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                    />
                    {steps.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => handleStepClick(s.id)}
                            disabled={s.id > step}
                            className={cn(
                                "relative z-10 w-8 h-8 rounded-full border-2 transition-all duration-500 flex items-center justify-center",
                                step === s.id ? "bg-emerald-500 border-white text-white shadow-lg scale-110" :
                                    step > s.id ? "bg-white border-emerald-500 text-emerald-500" : "bg-white border-slate-200 text-slate-200"
                            )}
                        >
                            {step > s.id ? <CheckCircle2 size={14} /> : <s.icon size={14} />}
                            <span className={cn(
                                "absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors",
                                step === s.id ? "text-emerald-600" : "text-slate-300"
                            )}>
                                {s.title}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden relative">
                    <div className="p-8 sm:p-10">
                        <AnimatePresence mode="wait">
                            {renderStep()}
                        </AnimatePresence>

                        <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-50">
                            <button
                                onClick={prevStep}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    step === 1 ? "opacity-0 pointer-events-none" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                <ArrowLeft size={16} /> Backward
                            </button>

                            {step < totalSteps ? (
                                <button
                                    onClick={nextStep}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all active:scale-95 group"
                                >
                                    Proceed <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => alert('Validation Success! Connecting to Checkout...')}
                                    disabled={!formData.declaration}
                                    className="bg-emerald-600 text-white px-10 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-emerald-500/40 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
                                >
                                    Finish & Pay <CheckCircle2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                    Hillingdon Athletic Club · Est 1966
                </p>
            </div>
        </div>
    );
};

export default MembershipForm;
