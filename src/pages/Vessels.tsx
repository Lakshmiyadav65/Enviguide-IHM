import { useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    Search, Plus, Layers, FileText, ShoppingCart,
    BarChart2, FileCheck, X, Check,
    FolderOpen, Ship as ShipIcon
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './Vessels.css';

interface VesselData {
    name: string;
    shipOwner: string;
    fleet: string;
    subFleet: string;
    vesselClass: string;
    imoNo: string;
    registrationNumber: string;
    deliveryDate: string;
    deadweightTonnage: string;
    portOfRegistry: string;
    socExpiryDate: string;
    type: string;
    shipManager: string;
    registeredOwner: string;
    flagState: string;
    vesselIhmClass: string;
    classIdNo: string;
    nameOfYard: string;
    keelLaidDate: string;
    grossTonnage: string;
    teuUnits: string;
    ihmReference: string;
    signalLetters: string;
    buildersUniqueId: string;
    mdStandard: string;
    socReference: string;
    image: string;
}

const INITIAL_VESSELS: VesselData[] = [
    {
        name: 'ACOSTA',
        shipOwner: 'AQUARIUS BULKCARRIER',
        fleet: 'Fleet A',
        subFleet: 'Sub Fleet 1',
        vesselClass: 'Registro Italiano Navale',
        imoNo: '9571648',
        registrationNumber: 'REG-123',
        deliveryDate: '2013-06-01',
        deadweightTonnage: '34236',
        portOfRegistry: 'Panama - 44761PEXT',
        socExpiryDate: '2028-06-29',
        type: 'Bulk Carrier',
        shipManager: 'AQUARIUS BULKCARRIER',
        registeredOwner: 'SCARLET STREET CORP',
        flagState: 'Panama',
        vesselIhmClass: 'Registro Italiano Navale',
        classIdNo: 'CID-998',
        nameOfYard: 'SHANGHAI SHIPYARD',
        keelLaidDate: '2011-12-27',
        grossTonnage: '22414',
        teuUnits: '0',
        ihmReference: 'IHM Report: J-1109202',
        signalLetters: '3FHM7',
        buildersUniqueId: 'BUILD-99',
        mdStandard: 'IMO',
        socReference: 'IHM-00670',
        image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800'
    },
    {
        name: 'AFIF',
        shipOwner: 'GLOBAL SHIPPING',
        fleet: 'Fleet B',
        subFleet: 'Sub Fleet 2',
        vesselClass: 'DNV',
        imoNo: '9308642',
        registrationNumber: 'REG-456',
        deliveryDate: '2015-08-15',
        deadweightTonnage: '45000',
        portOfRegistry: 'Liberia',
        socExpiryDate: '2030-10-10',
        type: 'Container Ship',
        shipManager: 'GLOBAL MANAGERS',
        registeredOwner: 'OCEAN BLUE INC',
        flagState: 'Liberia',
        vesselIhmClass: 'DNV',
        classIdNo: 'CID-777',
        nameOfYard: 'HYUNDAI HEAVY',
        keelLaidDate: '2014-02-05',
        grossTonnage: '30000',
        teuUnits: '5000',
        ihmReference: 'IHM Report: G-9922',
        signalLetters: 'ABCD4',
        buildersUniqueId: 'BUILD-45',
        mdStandard: 'IHM Method',
        socReference: 'IHM-9988',
        image: 'https://images.unsplash.com/photo-1494412574743-01947f15b6b7?auto=format&fit=crop&q=80&w=800'
    }
];

const EMPTY_FORM: VesselData = {
    name: '', shipOwner: '', fleet: '', subFleet: '', vesselClass: '',
    imoNo: '', registrationNumber: '', deliveryDate: '', deadweightTonnage: '',
    portOfRegistry: '', socExpiryDate: '', type: '', shipManager: '',
    registeredOwner: '', flagState: '', vesselIhmClass: '', classIdNo: '',
    nameOfYard: '', keelLaidDate: '', grossTonnage: '', teuUnits: '',
    ihmReference: '', signalLetters: '', buildersUniqueId: '',
    mdStandard: 'IMO', socReference: '',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800'
};

export default function Vessels() {
    const { id } = useParams();
    const [vesselList, setVesselList] = useState<VesselData[]>(INITIAL_VESSELS);
    const [activeVesselName, setActiveVesselName] = useState('ACOSTA');
    const [activeTab, setActiveTab] = useState('project');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const [formData, setFormData] = useState<VesselData>(INITIAL_VESSELS[0]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredVessels = useMemo(() => {
        return vesselList.filter(v =>
            v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.imoNo.includes(searchTerm)
        );
    }, [vesselList, searchTerm]);

    const handleVesselSelect = (vessel: VesselData) => {
        setActiveVesselName(vessel.name);
        setFormData(vessel);
        setIsAdding(false);
    };

    const handleAddClick = () => {
        setIsAdding(true);
        setActiveVesselName('');
        setFormData(EMPTY_FORM);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (isAdding) {
            setVesselList(prev => [...prev, formData]);
            setIsAdding(false);
            setActiveVesselName(formData.name);
        } else {
            setVesselList(prev => prev.map(v => v.name === activeVesselName ? formData : v));
        }
        alert('Vessel data saved successfully!');
    };

    const tabs = [
        { id: 'project', label: 'PROJECT', icon: FileCheck },
        { id: 'decks', label: 'Decks', icon: Layers },
        { id: 'documents', label: 'Documents', icon: FolderOpen },
        { id: 'materials', label: 'Materials Record', icon: FileText },
        { id: 'purchase', label: 'Purchase Orders', icon: ShoppingCart },
        { id: 'reports', label: 'Reports', icon: BarChart2 },
        { id: 'certificate', label: 'IHM Certificate', icon: FileCheck },
    ];

    const renderContent = () => {
        if (id !== 'ship') {
            return (
                <div className="vessels-placeholder">
                    <div className="placeholder-card">
                        <ShipIcon size={48} color="#94A3B8" />
                        <h3>{id?.replace('-', ' ').toUpperCase()} Management</h3>
                        <p>Detailed module for {id?.replace('-', ' ')} is under maintenance.</p>
                        <button className="add-vessel-btn" style={{ margin: '20px auto 0' }}>
                            Go Back to Ship
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="form-scroll-area">
                <div className="vessel-form-card premium-shadow">
                    <form onSubmit={handleSave}>
                        <div className="form-grid">
                            <div className="form-col">
                                <FormGroup label="Name" name="name" value={formData.name} onChange={handleInputChange} required />
                                <FormGroup label="Ship Owner" name="shipOwner" value={formData.shipOwner} onChange={handleInputChange} required />
                                <FormGroup label="Fleet" name="fleet" value={formData.fleet} onChange={handleInputChange} />
                                <FormGroup label="Sub Fleet" name="subFleet" value={formData.subFleet} onChange={handleInputChange} />
                                <FormGroup label="Vessel Class" name="vesselClass" value={formData.vesselClass} onChange={handleInputChange} />
                                <FormGroup label="IMO No" name="imoNo" value={formData.imoNo} onChange={handleInputChange} required />
                                <FormGroup label="Registration Number" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} />
                                <DateGroup label="Delivery Date" name="deliveryDate" value={formData.deliveryDate} onChange={handleInputChange} />
                                <FormGroup label="Deadweight Tonnage" name="deadweightTonnage" value={formData.deadweightTonnage} onChange={handleInputChange} />
                                <FormGroup label="Port of Registry" name="portOfRegistry" value={formData.portOfRegistry} onChange={handleInputChange} />
                                <DateGroup label="SOC Expiry Date" name="socExpiryDate" value={formData.socExpiryDate} onChange={handleInputChange} />
                            </div>

                            <div className="form-col">
                                <FormGroup label="Type" name="type" value={formData.type} onChange={handleInputChange} />
                                <FormGroup label="Ship Manager" name="shipManager" value={formData.shipManager} onChange={handleInputChange} />
                                <FormGroup label="Registered Owner" name="registeredOwner" value={formData.registeredOwner} onChange={handleInputChange} />
                                <FormGroup label="Flag State" name="flagState" value={formData.flagState} onChange={handleInputChange} />
                                <FormGroup label="Vessel IHM Class" name="vesselIhmClass" value={formData.vesselIhmClass} onChange={handleInputChange} />
                                <FormGroup label="Class ID No" name="classIdNo" value={formData.classIdNo} onChange={handleInputChange} />
                                <FormGroup label="Name Of Yard" name="nameOfYard" value={formData.nameOfYard} onChange={handleInputChange} />
                                <DateGroup label="Keel Laid Date" name="keelLaidDate" value={formData.keelLaidDate} onChange={handleInputChange} />
                                <FormGroup label="Gross Tonnage" name="grossTonnage" value={formData.grossTonnage} onChange={handleInputChange} />
                                <FormGroup label="TEU No of Units" name="teuUnits" value={formData.teuUnits} onChange={handleInputChange} />
                                <FormGroup label="Initial IHM Reference" name="ihmReference" value={formData.ihmReference} onChange={handleInputChange} />
                            </div>

                            <div className="form-col">
                                <div className="form-group">
                                    <label>Choose file</label>
                                    <div className="file-upload-section">
                                        <div className="image-preview luxury-border">
                                            <img src={formData.image} alt="Ship" />
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        <div className="choose-file-btn" onClick={triggerFileSelect}>Choose file</div>
                                        <p className="file-hint">Image should not exceed 10MB</p>
                                    </div>
                                </div>
                                <FormGroup label="Signal Letters" name="signalLetters" value={formData.signalLetters} onChange={handleInputChange} />
                                <FormGroup label="Builders unique id of ship" name="buildersUniqueId" value={formData.buildersUniqueId} onChange={handleInputChange} />
                                <div className="form-group">
                                    <label>MD Standard</label>
                                    <div className="radio-group-modern">
                                        {['IMO', 'IHM Method', 'Nil'].map(standard => (
                                            <label key={standard} className="radio-item-modern">
                                                <input
                                                    type="radio"
                                                    name="mdStandard"
                                                    checked={formData.mdStandard === standard}
                                                    onChange={() => setFormData(prev => ({ ...prev, mdStandard: standard }))}
                                                />
                                                <span>{standard}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <FormGroup label="SOC Reference" name="socReference" value={formData.socReference} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="form-actions-premium">
                            <button type="button" className="action-btn-p cancel-p" onClick={() => handleVesselSelect(vesselList[0])}>
                                <X size={20} />
                                <span>Cancel</span>
                            </button>
                            <button type="submit" className="action-btn-p submit-p">
                                <Check size={20} />
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard-wrapper">
            <Sidebar />
            <main className="main-content">
                <Header />
                <div className="vessels-wrapper">
                    <aside className="secondary-sidebar">
                        <div className="vessel-search-container">
                            <div className="vessel-search-box">
                                <Search size={16} color="#94A3B8" />
                                <input
                                    type="text"
                                    placeholder="Search vessels..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="vessel-list">
                            {filteredVessels.map((vessel) => (
                                <div
                                    key={vessel.name}
                                    className={`vessel-item ${activeVesselName === vessel.name ? 'active' : ''}`}
                                    onClick={() => handleVesselSelect(vessel)}
                                >
                                    <div className={`vessel-status-dot ${vessel.name === 'ACOSTA' ? 'v-active' : ''}`}></div>
                                    <div className="vessel-info-block">
                                        <h4>{vessel.name}</h4>
                                        <p>IMO {vessel.imoNo}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="add-vessel-btn" onClick={handleAddClick}>
                            <Plus size={20} />
                            Add Vessel
                        </button>
                    </aside>

                    <div className="vessels-main">
                        <nav className="content-tabs">
                            {tabs.map(tab => (
                                <div
                                    key={tab.id}
                                    className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </div>
                            ))}
                        </nav>
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
}

// Helper Components
const FormGroup = ({ label, name, value, onChange, required }: { label: string, name: string, value: string, onChange: (e: any) => void, required?: boolean }) => (
    <div className="form-group">
        <label>{label} {required && <span className="required">*</span>}</label>
        <input type="text" name={name} className="form-control" value={value} onChange={onChange} />
    </div>
);

const DateGroup = ({ label, name, value, onChange }: { label: string, name: string, value: string, onChange: (e: any) => void }) => (
    <div className="form-group">
        <label>{label}</label>
        <div className="date-input-wrapper">
            <input
                type="date"
                name={name}
                className="form-control"
                value={value}
                onChange={onChange}
                onKeyDown={(e) => e.preventDefault()}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                style={{ cursor: 'pointer' }}
            />
        </div>
    </div>
);
