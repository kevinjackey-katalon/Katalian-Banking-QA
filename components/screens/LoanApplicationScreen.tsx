import React, { useState } from 'react';
import { User, Loan, LoanApplicationData } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import { STATES, ID_TYPES } from '../../constants';

interface LoanApplicationScreenProps {
    user: User;
    loanType: Loan['type'];
    onNavigate: () => void;
    onSubmit: (loanData: LoanApplicationData, type: Loan['type']) => void;
}

const TOTAL_STEPS = 4;

const LoanApplicationScreen: React.FC<LoanApplicationScreenProps> = ({ loanType, onNavigate, onSubmit }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [ekycError, setEkycError] = useState('');
    const [formData, setFormData] = useState<Partial<LoanApplicationData>>({
        firstName: '', lastName: '', dob: '', address: '', city: '', state: STATES[0], zip: '',
        employer: '', jobTitle: '', annualIncome: 0, loanAmount: 0, loanTerm: 12, purpose: '',
        idType: ID_TYPES[0], idNumber: '', idFrontUploaded: false, idBackUploaded: false, livenessVerified: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: (e.target.type === 'number') ? parseFloat(value) : value }));
    };

    const handleNext = () => {
        if (step === 2 && !(formData.idFrontUploaded && formData.idBackUploaded && formData.livenessVerified)) {
            setEkycError('Please complete document upload and the liveness check before continuing.');
            return;
        }
        setEkycError('');
        setStep(s => s + 1);
    };
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(async () => {
            await onSubmit(formData as LoanApplicationData, loanType);
            setLoading(false);
        }, 1500);
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tight">Personal Verification</h3>
                            <p className="text-slate-500 text-sm font-medium">Verify your identity for the lending institution.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input id="firstName" name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} required />
                            <Input id="lastName" name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} required />
                        </div>
                        <Input id="dob" name="dob" label="Date of Birth" type="date" value={formData.dob} onChange={handleChange} required />
                        <Input id="address" name="address" label="Primary Residence" value={formData.address} onChange={handleChange} required />
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tight">Electronic KYC</h3>
                            <p className="text-slate-500 text-sm font-medium">Confirm your identity document and complete a liveness check.</p>
                        </div>

                        {ekycError && (
                            <div id="ekyc_error" className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[10px] font-black uppercase text-center">
                                {ekycError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">ID Document Type</label>
                                <select name="idType" id="idType" value={formData.idType} onChange={handleChange} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm font-medium outline-none">
                                    {ID_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <Input id="idNumber" name="idNumber" label="ID Number" value={formData.idNumber} onChange={handleChange} required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                type="button"
                                id="button_uploadIdFront"
                                onClick={() => setFormData(prev => ({ ...prev, idFrontUploaded: true }))}
                                className={`p-6 rounded-3xl border text-left transition-all ${formData.idFrontUploaded ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                            >
                                <p className="text-2xl mb-2">{formData.idFrontUploaded ? '✅' : '🪪'}</p>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-300">{formData.idFrontUploaded ? 'Front Uploaded' : 'Upload ID Front'}</p>
                            </button>
                            <button
                                type="button"
                                id="button_uploadIdBack"
                                onClick={() => setFormData(prev => ({ ...prev, idBackUploaded: true }))}
                                className={`p-6 rounded-3xl border text-left transition-all ${formData.idBackUploaded ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                            >
                                <p className="text-2xl mb-2">{formData.idBackUploaded ? '✅' : '🪪'}</p>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-300">{formData.idBackUploaded ? 'Back Uploaded' : 'Upload ID Back'}</p>
                            </button>
                        </div>

                        <button
                            type="button"
                            id="button_runLivenessCheck"
                            onClick={() => setFormData(prev => ({ ...prev, livenessVerified: true }))}
                            className={`w-full p-6 rounded-3xl border text-center transition-all ${formData.livenessVerified ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                        >
                            <p className="text-2xl mb-2">{formData.livenessVerified ? '✅' : '🤳'}</p>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-300">{formData.livenessVerified ? 'Liveness Check Passed' : 'Run Selfie Liveness Check'}</p>
                        </button>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tight">Capital & Employment</h3>
                            <p className="text-slate-500 text-sm font-medium">Verify your income sources for risk assessment.</p>
                        </div>
                        <div className="space-y-6">
                            <Input id="employer" name="employer" label="Current Employer" value={formData.employer} onChange={handleChange} required />
                            <Input id="jobTitle" name="jobTitle" label="Job Title" value={formData.jobTitle} onChange={handleChange} required />
                            <Input id="annualIncome" name="annualIncome" label="Annual Income ($)" type="number" value={formData.annualIncome} onChange={handleChange} required />
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tight">Facility Requirements</h3>
                            <p className="text-slate-500 text-sm font-medium">Define repayment and utilization parameters.</p>
                        </div>
                        <div className="space-y-6">
                            <Input id="loanAmount" name="loanAmount" label="Required Amount ($)" type="number" value={formData.loanAmount} onChange={handleChange} required />
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Proposed Term</label>
                                <select name="loanTerm" id="loanTerm" value={formData.loanTerm} onChange={handleChange} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm font-medium outline-none">
                                    <option value="12">12 Months</option>
                                    <option value="24">24 Months</option>
                                    <option value="36">36 Months</option>
                                </select>
                            </div>
                            <textarea name="purpose" id="purpose" value={formData.purpose} onChange={handleChange} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm font-medium h-32 focus:border-emerald-500/50 outline-none transition-all resize-none" placeholder="Description of capital utilization..." />
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="bg-slate-900 border border-white/5 p-10 md:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
                    <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}></div>
                </div>

                <div className="flex justify-between items-center mb-16">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{loanType} <span className="text-slate-500 font-normal">Facility</span></h2>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">{loading ? 'Processing' : `Step ${step} of ${TOTAL_STEPS}`}</p>
                    </div>
                    {!loading && (
                        <button onClick={() => onNavigate()} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
                        <Spinner />
                        <h4 className="text-xl font-black text-white uppercase tracking-widest">Running Risk Profile</h4>
                    </div>
                ) : (
                    <form onSubmit={step === TOTAL_STEPS ? handleSubmit : (e) => e.preventDefault()} className="space-y-12">
                        <div className="min-h-[300px]">{renderStep()}</div>
                        <div className="flex justify-between items-center pt-8 border-t border-white/5">
                            <div>{step > 1 && <Button type="button" variant="secondary" onClick={handleBack} className="!rounded-full px-8">Back</Button>}</div>
                            <div className="flex gap-4">
                                {step < TOTAL_STEPS ? <Button id="button_continueStep" type="button" onClick={handleNext} className="!rounded-full px-10">Continue</Button> : <Button id="button_submitApplication" type="submit" className="!rounded-full px-10">Submit Application</Button>}
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoanApplicationScreen;
