import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
    Search, Plus, Filter, Layers, FileText, ShoppingCart,
    BarChart2, FileCheck, Check, Edit2, X,
    FolderOpen, Ship as ShipIcon, Pin, Upload, Eye, Trash2, Calendar, ChevronDown, ChevronUp,
    Download, AlertTriangle, ExternalLink, ChevronLeft, ChevronRight
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './Vessels.css';
import MaterialsRecord from './MaterialsRecord';
import PurchaseOrderView from './PurchaseOrderView';
import DecksView from './DecksView';
import vesselDefault from '../assets/images/vessel_default.jpg';

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
    ihmMethod: string;
    socReference: string;
    image: string;
}

const INITIAL_VESSELS: VesselData[] = [
    {
        name: 'MV Ocean Pioneer',
        shipOwner: 'MARITIME SOLUTIONS',
        fleet: 'Blue Fleet',
        subFleet: 'Atlantic',
        vesselClass: 'DNV',
        imoNo: '9876543',
        registrationNumber: 'REG-987',
        deliveryDate: '2020-01-01',
        deadweightTonnage: '50000',
        portOfRegistry: 'Panama',
        socExpiryDate: '2025-06-15',
        type: 'Bulk Carrier',
        shipManager: 'OCEAN MANAGERS',
        registeredOwner: 'PIONEER SHIPPING',
        flagState: 'Panama',
        vesselIhmClass: 'DNV',
        classIdNo: 'CID-111',
        nameOfYard: 'GLOBAL YARD',
        keelLaidDate: '2018-05-12',
        grossTonnage: '35000',
        teuUnits: '0',
        ihmReference: 'IHM-P-2024',
        signalLetters: 'PION',
        buildersUniqueId: 'BUILD-P1',
        mdStandard: 'HKC',
        ihmMethod: 'NB',
        socReference: 'SOC-998',
        image: vesselDefault
    },
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
        mdStandard: 'HKC',
        ihmMethod: 'NB',
        socReference: 'IHM-00670',
        image: vesselDefault
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
        mdStandard: 'EU',
        ihmMethod: 'ES',
        socReference: 'IHM-9988',
        image: vesselDefault
    },
    {
        name: 'PACIFIC HORIZON',
        shipOwner: 'PACIFIC TRADING',
        fleet: 'Pacific',
        subFleet: 'North',
        vesselClass: 'ABS',
        imoNo: '9234567',
        registrationNumber: 'REG-567',
        deliveryDate: '2010-05-20',
        deadweightTonnage: '28000',
        portOfRegistry: 'Singapore',
        socExpiryDate: '2025-03-10',
        type: 'Bulk Carrier',
        shipManager: 'PACIFIC SHIP MGMT',
        registeredOwner: 'HORIZON MARITIME',
        flagState: 'Singapore',
        vesselIhmClass: 'ABS',
        classIdNo: 'CID-555',
        nameOfYard: 'SINGAPORE YARD',
        keelLaidDate: '2008-01-15',
        grossTonnage: '18000',
        teuUnits: '0',
        ihmReference: 'IHM-PH-10',
        signalLetters: 'PHOR',
        buildersUniqueId: 'BUILD-P5',
        mdStandard: 'HKC',
        ihmMethod: 'NB',
        socReference: 'SOC-556',
        image: vesselDefault
    },
    {
        name: 'MV NORTH STAR',
        shipOwner: 'NORTHERN SHIPPING',
        fleet: 'Arctic',
        subFleet: 'North',
        vesselClass: 'DNV',
        imoNo: '9876543',
        registrationNumber: 'REG-999',
        deliveryDate: '2022-11-30',
        deadweightTonnage: '35000',
        portOfRegistry: 'Oslo',
        socExpiryDate: '2032-11-30',
        type: 'Ice Breaker',
        shipManager: 'ARCTIC MGMT',
        registeredOwner: 'NORTH STAR AS',
        flagState: 'Norway',
        vesselIhmClass: 'DNV',
        classIdNo: 'CID-999',
        nameOfYard: 'VARD YARD',
        keelLaidDate: '2021-01-10',
        grossTonnage: '25000',
        teuUnits: '0',
        ihmReference: 'IHM-NS-01',
        signalLetters: 'NSTR',
        buildersUniqueId: 'B-STAR-1',
        mdStandard: 'EU',
        ihmMethod: 'ES',
        socReference: 'SOC-NS-01',
        image: vesselDefault
    },
];

const EMPTY_FORM: VesselData = {
    name: '', shipOwner: '', fleet: '', subFleet: '', vesselClass: '',
    imoNo: '', registrationNumber: '', deliveryDate: '', deadweightTonnage: '',
    portOfRegistry: '', socExpiryDate: '', type: '', shipManager: '',
    registeredOwner: '', flagState: '', vesselIhmClass: '', classIdNo: '',
    nameOfYard: '', keelLaidDate: '', grossTonnage: '', teuUnits: '',
    ihmReference: '', signalLetters: '', buildersUniqueId: '',
    mdStandard: 'HKC', ihmMethod: 'NB', socReference: '',
    image: ''
};

export default function Vessels() {
    const { id } = useParams();
    const location = useLocation();
    const [vesselList, setVesselList] = useState<VesselData[]>(INITIAL_VESSELS);
    const [activeVesselName, setActiveVesselName] = useState('MV Ocean Pioneer');
    const [activeTab, setActiveTab] = useState(location.pathname === '/decks' ? 'decks' : 'project');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);

    // Custom Dropdown States
    const [isDocTypeDropdownOpen, setIsDocTypeDropdownOpen] = useState(false);
    const [isDocCategoryDropdownOpen, setIsDocCategoryDropdownOpen] = useState(false);
    const [isDocStatusDropdownOpen, setIsDocStatusDropdownOpen] = useState(false);

    const docTypeRef = useRef<HTMLDivElement>(null);
    const docCategoryRef = useRef<HTMLDivElement>(null);
    const docStatusRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (docTypeRef.current && !docTypeRef.current.contains(event.target as Node)) setIsDocTypeDropdownOpen(false);
            if (docCategoryRef.current && !docCategoryRef.current.contains(event.target as Node)) setIsDocCategoryDropdownOpen(false);
            if (docStatusRef.current && !docStatusRef.current.contains(event.target as Node)) setIsDocStatusDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Purchase Order Filters Lifted State
    const [poFilterDateFrom, setPoFilterDateFrom] = useState('');
    const [poFilterDateTo, setPoFilterDateTo] = useState('');
    const [poFilterCompliance, setPoFilterCompliance] = useState('All');

    const [vesselDocuments, setVesselDocuments] = useState<{ [key: string]: any[] }>({
        'MV Ocean Pioneer': Array.from({ length: 45 }, (_, i) => ({
            id: i + 1,
            name: [
                'International Air Pollution Prevention Cert',
                'Main Engine Maintenance Manual',
                'Upper Deck GA Plan Revision B',
                'Hazardous Materials Declaration - Deck A',
                'Safety Equipment Inventory',
                'Load Line Certificate',
                'Crew List Declaration',
                'Waste Management Plan',
                'Emergency Towing Booklet',
                'Ship Energy Efficiency Management Plan',
                'SOPEP Manual',
                'Stability Booklet'
            ][i % 12] + (i > 11 ? ` - Part ${Math.floor(i / 12) + 1}` : ''),
            type: ['Certificate', 'Manual', 'Drawing', 'Declaration', 'Certificate', 'Certificate', 'Declaration', 'Manual', 'Manual', 'Manual', 'Manual', 'Manual'][i % 12],
            uploadedBy: i % 2 === 0 ? 'John Admin' : 'M. Smith',
            date: 'Oct 12, 2023',
            status: i % 7 === 0 ? 'Expiring' : 'Active',
            initials: i % 2 === 0 ? 'JA' : 'MS'
        })),
        'ACOSTA': Array.from({ length: 32 }, (_, i) => ({
            id: i + 1,
            name: [
                'Registry Certificate Panama',
                'Cargo Handling Manual',
                'Ballast Water Management Plan',
                'Fire Safety Certificate',
                'Ship Security Plan',
                'Navigation Equipment Certificate',
                'Radio License Certificate',
                'Tonnage Certificate',
                'Cargo Securing Manual',
                'Grain Loading Manual',
                'Safety Management System',
                'Technical Specification GA'
            ][i % 12] + (i > 11 ? ` - Rev ${Math.floor(i / 12) + 1}` : ''),
            type: ['Certificate', 'Manual', 'Manual', 'Certificate', 'Manual', 'Certificate', 'Certificate', 'Certificate', 'Manual', 'Manual', 'Manual', 'Drawing'][i % 12],
            uploadedBy: i % 3 === 0 ? 'Admin' : i % 3 === 1 ? 'J. Smith' : 'M. Brown',
            date: ['Jan 10, 2024', 'Feb 15, 2024', 'Mar 20, 2024'][i % 3],
            status: i % 8 === 0 ? 'Expiring' : 'Active',
            initials: i % 3 === 0 ? 'AD' : i % 3 === 1 ? 'JS' : 'MB'
        })),
        'AFIF': Array.from({ length: 25 }, (_, i) => ({
            id: i + 1,
            name: [
                'International Oil Pollution Prevention Certificate',
                'Minimum Safe Manning Document',
                'Stability Information Booklet',
                'Cargo Securing Manual',
                'Oil Record Book',
                'Garbage Management Plan',
                'ISPS Security Certificate',
                'Class Certificate',
                'Life Saving Appliance Plan',
                'Engine Log Book'
            ][i % 10] + (i > 9 ? ` - Vol ${Math.floor(i / 10) + 1}` : ''),
            type: ['Certificate', 'Certificate', 'Manual', 'Manual', 'Manual', 'Manual', 'Certificate', 'Certificate', 'Drawing', 'Manual'][i % 10],
            uploadedBy: i % 2 === 0 ? 'K. Wilson' : 'R. Davis',
            date: ['Nov 05, 2023', 'Dec 12, 2023'][i % 2],
            status: i % 9 === 0 ? 'Expiring' : 'Active',
            initials: i % 2 === 0 ? 'KW' : 'RD'
        })),
        'PACIFIC HORIZON': Array.from({ length: 28 }, (_, i) => ({
            id: i + 1,
            name: [
                'Continuous Synopsis Record',
                'Fuel Oil Quality Certificate',
                'Bunker Delivery Notes',
                'Voyage Data Recorder Certificate',
                'Emergency Response Procedures',
                'Maintenance Schedule',
                'Inspection Reports',
                'Training Records',
                'Shipboard Oil Pollution Emergency Plan',
                'Medical Chest Certificate'
            ][i % 10] + (i > 9 ? ` - ${2024 - Math.floor(i / 10)}` : ''),
            type: ['Certificate', 'Certificate', 'Declaration', 'Certificate', 'Manual', 'Manual', 'Drawing', 'Manual', 'Manual', 'Certificate'][i % 10],
            uploadedBy: i % 3 === 0 ? 'S. Anderson' : i % 3 === 1 ? 'T. Martinez' : 'L. Taylor',
            date: ['Aug 22, 2023', 'Sep 18, 2023', 'Oct 30, 2023'][i % 3],
            status: i % 10 === 0 ? 'Expiring' : 'Active',
            initials: i % 3 === 0 ? 'SA' : i % 3 === 1 ? 'TM' : 'LT'
        })),
        'MV NORTH STAR': Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            name: [
                'Ice Class Certificate',
                'Polar Code Compliance Document',
                'Heated Tank Plan',
                'Winterization Manual',
                'Ice Breaker Operational Manual',
                'Registry Norway',
                'Safe Manning Polar',
                'Arctic Navigation Chart List'
            ][i % 8] + (i > 7 ? ` - Part ${Math.floor(i / 8) + 1}` : ''),
            type: ['Certificate', 'Certificate', 'Drawing', 'Manual', 'Manual', 'Certificate', 'Certificate', 'Drawing'][i % 8],
            uploadedBy: i % 2 === 0 ? 'O. Nilsen' : 'E. Johansen',
            date: 'Dec 05, 2023',
            status: 'Active',
            initials: i % 2 === 0 ? 'ON' : 'EJ'
        }))
    });

    const [docSearch, setDocSearch] = useState('');
    const [docCategory, setDocCategory] = useState('All');
    const [docStatus, setDocStatus] = useState('All');

    const [formData, setFormData] = useState<VesselData>(INITIAL_VESSELS[0]);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isDraggingFile, setIsDraggingFile] = useState(false);

    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [docToDelete, setDocToDelete] = useState<any>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [newDocType, setNewDocType] = useState('Select Document Type');
    const [docPage, setDocPage] = useState(1);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const docsPerPage = 7;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);


    const activeVesselData = useMemo(() => {
        return vesselList.find(v => v.name === activeVesselName);
    }, [vesselList, activeVesselName]);

    const handleVesselSelect = (vessel: VesselData) => {
        setActiveVesselName(vessel.name);
        setFormData(vessel);
        setIsAdding(false);
        setIsEditing(false);
    };

    const handleAddClick = () => {
        setIsAdding(true);
        setIsEditing(true);
        setActiveVesselName('');
        setFormData(EMPTY_FORM);
        setActiveTab('project');
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
            // Clear input value so same file can be selected again if needed
            e.target.value = '';
        }
    };

    const triggerFileSelect = () => {
        if (!isEditing) return;
        fileInputRef.current?.click();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (isEditing) setIsDraggingFile(true);
    };

    const handleDragLeave = () => {
        setIsDraggingFile(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingFile(false);
        if (!isEditing) return;

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (isAdding) {
            setVesselList(prev => [...prev, formData]);
            setIsAdding(false);
            setIsEditing(false);
            setActiveVesselName(formData.name);
            setModalMessage('New vessel added successfully!');
        } else {
            setVesselList(prev => prev.map(v => v.name === activeVesselName ? formData : v));
            setIsEditing(false);
            setModalMessage('Vessel data updated successfully!');
        }
        setShowModal(true);
    };

    // Documents Logic
    const handleDeleteDocClick = (doc: any) => {
        setDocToDelete(doc);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteDoc = () => {
        if (docToDelete) {
            setVesselDocuments(prev => ({
                ...prev,
                [activeVesselName]: prev[activeVesselName].filter(d => d.id !== docToDelete.id)
            }));
            setShowDeleteConfirm(false);
            setDocToDelete(null);
            setModalMessage('Document deleted successfully!');
            setShowModal(true);
        }
    };

    const handleDocUpload = () => {
        if (!selectedFile) {
            docInputRef.current?.click();
            return;
        }

        if (newDocType === 'Select Document Type') {
            alert('Please select a document type first');
            return;
        }

        const newDoc = {
            id: Date.now(),
            name: selectedFile.name,
            type: newDocType,
            uploadedBy: 'John Admin',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            status: 'Active',
            initials: 'JA'
        };

        setVesselDocuments(prev => ({
            ...prev,
            [activeVesselName]: [newDoc, ...prev[activeVesselName]]
        }));

        setModalMessage(`'${selectedFile.name}' uploaded successfully!`);
        setShowModal(true);
        setSelectedFile(null); // Reset selection
        if (docInputRef.current) docInputRef.current.value = ''; // Reset input
    };

    const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleDocDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const tabs = [
        { id: 'project', label: 'Project', icon: FileCheck },
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

        if (activeTab === 'documents') {
            const currentDocs = vesselDocuments[activeVesselName] || [];
            const filteredDocs = currentDocs.filter(doc =>
                doc.name.toLowerCase().includes(docSearch.toLowerCase()) &&
                (docCategory === 'All' || doc.type === docCategory) &&
                (docStatus === 'All' || doc.status === docStatus)
            );

            const paginatedDocs = filteredDocs.slice((docPage - 1) * docsPerPage, docPage * docsPerPage);

            return (
                <div className="documents-container">
                    <div className="doc-upload-banner">
                        <div className="upload-brand">
                            <Upload size={20} color="#00B0FA" />
                            <span className="upload-label">Upload Document</span>
                        </div>
                        <div className="upload-slot">
                            <div
                                className={`upload-dropzone ${selectedFile ? 'file-selected' : ''}`}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDocDrop}
                                onClick={() => docInputRef.current?.click()}
                            >
                                {selectedFile ? (
                                    <div className="selected-file-display">
                                        <FileText size={18} color="#00B0FA" />
                                        <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                                    </div>
                                ) : (
                                    <span>Choose file or drag and drop...</span>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={docInputRef}
                                style={{ display: 'none' }}
                                onChange={handleDocFileChange}
                            />
                            <div className="custom-select-wrapper" style={{ position: 'relative' }} ref={docTypeRef}>
                                <div
                                    className={`doc-type-select ${isDocTypeDropdownOpen ? 'active' : ''}`}
                                    onClick={() => setIsDocTypeDropdownOpen(!isDocTypeDropdownOpen)}
                                >
                                    {newDocType}
                                </div>
                                {isDocTypeDropdownOpen && (
                                    <div className="custom-dropdown-menu">
                                        {['Select Document Type', 'Certificate', 'Manual', 'Drawing', 'Declaration'].map(option => (
                                            <div
                                                key={option}
                                                className={`custom-dropdown-item ${newDocType === option ? 'active' : ''}`}
                                                onClick={() => {
                                                    setNewDocType(option);
                                                    setIsDocTypeDropdownOpen(false);
                                                }}
                                            >
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button className="upload-exec-btn" onClick={handleDocUpload}>
                                <Upload size={18} /> {selectedFile ? 'Upload Now' : 'Select File'}
                            </button>
                        </div>
                    </div>

                    <div className="doc-filters-bar">
                        <div className="doc-search-input">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search by filename..."
                                value={docSearch}
                                onChange={(e) => setDocSearch(e.target.value)}
                            />
                        </div>

                        <div className="custom-select-wrapper" style={{ position: 'relative' }} ref={docCategoryRef}>
                            <div
                                className={`doc-filter-select ${isDocCategoryDropdownOpen ? 'active' : ''}`}
                                onClick={() => setIsDocCategoryDropdownOpen(!isDocCategoryDropdownOpen)}
                            >
                                {docCategory === 'All' ? 'Category' : docCategory}
                            </div>
                            {isDocCategoryDropdownOpen && (
                                <div className="custom-dropdown-menu">
                                    {['All', 'Certificate', 'Manual', 'Drawing', 'Declaration'].map(option => (
                                        <div
                                            key={option}
                                            className={`custom-dropdown-item ${docCategory === option ? 'active' : ''}`}
                                            onClick={() => {
                                                setDocCategory(option);
                                                setIsDocCategoryDropdownOpen(false);
                                            }}
                                        >
                                            {option === 'All' ? 'Category' : option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="custom-select-wrapper" style={{ position: 'relative' }} ref={docStatusRef}>
                            <div
                                className={`doc-filter-select ${isDocStatusDropdownOpen ? 'active' : ''}`}
                                onClick={() => setIsDocStatusDropdownOpen(!isDocStatusDropdownOpen)}
                            >
                                {docStatus === 'All' ? 'Status' : docStatus}
                            </div>
                            {isDocStatusDropdownOpen && (
                                <div className="custom-dropdown-menu">
                                    {['All', 'Active', 'Expiring'].map(option => (
                                        <div
                                            key={option}
                                            className={`custom-dropdown-item ${docStatus === option ? 'active' : ''}`}
                                            onClick={() => {
                                                setDocStatus(option);
                                                setIsDocStatusDropdownOpen(false);
                                            }}
                                        >
                                            {option === 'All' ? 'Status' : option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="doc-date-range">
                            <Calendar size={18} />
                            <span>Select Date Range (From - To)</span>
                        </div>
                        <button className="clear-filters-link" onClick={() => { setDocSearch(''); setDocCategory('All'); setDocStatus('All'); }}>Clear Filters</button>
                    </div>

                    <div className="doc-table-wrapper">
                        <table className="doc-table">
                            <thead>
                                <tr>
                                    <th>DOCUMENT NAME</th>
                                    <th>TYPE</th>
                                    <th>UPLOADED BY</th>
                                    <th>DATE</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedDocs.map(doc => (
                                    <tr key={doc.id}>
                                        <td>
                                            <div className="doc-name-cell">
                                                <div className={`doc-type-icon ${doc.type.toLowerCase()}`}>
                                                    {doc.type === 'Certificate' && <FileText size={18} color="#EF4444" />}
                                                    {doc.type === 'Manual' && <FileText size={18} color="#3B82F6" />}
                                                    {doc.type === 'Drawing' && <Pin size={18} color="#00B0FA" />}
                                                    {doc.type === 'Declaration' && <FileText size={18} color="#94A3B8" />}
                                                </div>
                                                <span className="doc-name-txt">{doc.name}</span>
                                            </div>
                                        </td>
                                        <td><span className="doc-type-tag">{doc.type}</span></td>
                                        <td>
                                            <div className="doc-uploader">
                                                <div className="uploader-avatar">{doc.initials}</div>
                                                <span>{doc.uploadedBy}</span>
                                            </div>
                                        </td>
                                        <td><span className="doc-date-txt">{doc.date}</span></td>
                                        <td><span className={`status-pill ${doc.status.toLowerCase()}`}>{doc.status}</span></td>
                                        <td>
                                            <div className="doc-actions">
                                                <button className="action-icn-btn" onClick={() => setSelectedDoc(doc)}><Eye size={16} /></button>
                                                <button className="action-icn-btn" onClick={() => handleDeleteDocClick(doc)}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="doc-pagination-bar">
                            <span className="showing-text">SHOWING {paginatedDocs.length} OF {filteredDocs.length} DOCUMENTS</span>
                            <div className="pagination-arrows">
                                <button className="arrow-btn" onClick={() => setDocPage(p => Math.max(1, p - 1))} disabled={docPage === 1 || filteredDocs.length === 0}>
                                    <ChevronLeft size={16} />
                                </button>
                                <button className="arrow-btn" onClick={() => setDocPage(p => Math.min(Math.ceil(filteredDocs.length / docsPerPage), p + 1))} disabled={docPage === Math.ceil(filteredDocs.length / docsPerPage) || filteredDocs.length === 0}>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Preview Panel */}
                    {selectedDoc && (
                        <div className="preview-overlay">
                            <div className="preview-backdrop" onClick={() => setSelectedDoc(null)} />
                            <div className="preview-panel">
                                <div className="preview-header">
                                    <div className="preview-header-left">
                                        <Eye size={20} color="#00B0FA" />
                                        <h3>QUICK PREVIEW</h3>
                                    </div>
                                    <div className="preview-header-actions">
                                        <button className="preview-action-btn primary" onClick={() => window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank')}>
                                            <ExternalLink size={18} /> OPEN IN FULL VIEWER
                                        </button>
                                        <button
                                            className="preview-icon-btn"
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = 'data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmogCjw8CiAgL1R5cGUgL1BhZ2VzCiAgL01lZGlhQm94IFsgMCAwIDU5NSA4NDIgXQogIC9Db3VudCAxCiAgL0tpZHMgWyAzIDAgUiBdCj4+CmVuZG9iagoKMyAwIG9iago8PAogIC9UeXBlIC9QYWdlCiAgL1BhcmVudCAyIDAgUgo+PgplbmRvYmoKCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxMCAwMDAwMCBuIAowMDAwMDAwMDYwIDAwMDAwIG4gCjAwMDAwMDAxNTcgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDQKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMjEwCiUlRU9GCg=='; // Blank PDF
                                                link.download = `${selectedDoc?.name || 'document'}.pdf`;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                        >
                                            <Download size={18} />
                                        </button>
                                        <button className="preview-icon-btn" onClick={() => setSelectedDoc(null)}><X size={20} /></button>
                                    </div>
                                </div>
                                <div className="preview-panel-content">
                                    <div className="preview-document-card fit-content">
                                        <div className="doc-header-visual">
                                            <div className={`doc-visual-icon ${selectedDoc.type.toLowerCase()}`}>
                                                <FileText size={40} />
                                            </div>
                                            <div className="doc-badge-type">{selectedDoc.type.toUpperCase()} <span className="format-p">PDF</span></div>
                                            <div className="doc-id-ref">IAPP-2023-98765-P</div>
                                        </div>

                                        <h2 className="preview-doc-title">{selectedDoc.name.toUpperCase()}</h2>

                                        <div className="preview-metadata-grid">
                                            <div className="meta-item">
                                                <label>VESSEL NAME</label>
                                                <span>{activeVesselName}</span>
                                            </div>
                                            <div className="meta-item">
                                                <label>DISTINCTIVE NUMBER</label>
                                                <span>IMO {activeVesselData?.imoNo || 'N/A'}</span>
                                            </div>
                                            <div className="meta-item">
                                                <label>PORT OF REGISTRY</label>
                                                <span>{activeVesselData?.portOfRegistry || 'N/A'}</span>
                                            </div>
                                            <div className="meta-item">
                                                <label>GROSS TONNAGE</label>
                                                <span>{activeVesselData?.grossTonnage || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="doc-visual-placeholder" style={{ padding: 0, overflow: 'hidden', background: '#f1f5f9' }}>
                                            <iframe
                                                src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf#toolbar=0&navpanes=0&scrollbar=0"
                                                style={{ width: '100%', height: '100%', border: 'none' }}
                                                title="Document Preview"
                                            />
                                        </div>
                                        <div className="preview-footer">
                                            <div className="footer-meta-col">
                                                <label>SIGNED BY</label>
                                                <div className="meta-val">
                                                    <div className="avatar">CA</div>
                                                    <span>Capt. Anders</span>
                                                </div>
                                            </div>
                                            <div className="footer-meta-col">
                                                <label>EXPIRY DATE</label>
                                                <div className="meta-val">
                                                    <Calendar size={16} color="#F59E0B" />
                                                    <span>Oct 24, 2028</span>
                                                </div>
                                            </div>
                                            <div className="footer-meta-col">
                                                <label>LAST MODIFIED</label>
                                                <div className="meta-val">
                                                    <AlertTriangle size={16} color="#64748B" />
                                                    <span>2 days ago</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="preview-disclaimer">
                                    <AlertTriangle size={14} />
                                    <span>This is a secure preview. For technical editing, please use the Full Viewer.</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {showDeleteConfirm && (
                        <div className="modal-overlay">
                            <div className="modal-content success-card-modal delete">
                                <div className="modal-success-icon delete">
                                    <Trash2 size={40} />
                                </div>
                                <h2 className="modal-title">Confirm Delete</h2>
                                <p className="modal-message">
                                    Are you sure you want to delete '<strong>{docToDelete?.name}</strong>'?
                                    This action cannot be undone.
                                </p>
                                <div className="modal-actions-group">
                                    <button className="modal-action-btn cancel" onClick={() => setShowDeleteConfirm(false)}>
                                        CANCEL
                                    </button>
                                    <button className="modal-action-btn delete" onClick={confirmDeleteDoc}>
                                        DELETE
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (activeTab === 'decks') {
            return <DecksView key={activeVesselName} vesselName={activeVesselName} />;
        }

        if (activeTab === 'purchase') {
            const activeVessel = vesselList.find(v => v.name === activeVesselName);
            return (
                <PurchaseOrderView
                    key={activeVesselName}
                    vesselName={activeVesselName}
                    imo={activeVessel?.imoNo || ''}
                    filterDateFrom={poFilterDateFrom}
                    filterDateTo={poFilterDateTo}
                    filterCompliance={poFilterCompliance}
                />
            );
        }

        if (activeTab === 'materials') {
            return <MaterialsRecord key={activeVesselName} vesselName={activeVesselName} />;
        }

        return (
            <div className="form-scroll-area">
                <div className="vessel-form-card-premium">
                    <form onSubmit={handleSave} className="vessel-edit-form-modern">
                        <div className="form-grid-three-col">
                            {/* Column 1 */}
                            <div className="form-column">
                                <FormGroup label="Name" name="name" value={formData.name} onChange={handleInputChange} required readOnly={!isEditing} />
                                <FormGroup label="Ship Owner" name="shipOwner" value={formData.shipOwner} onChange={handleInputChange} required readOnly={!isEditing} />
                                <FormGroup label="Fleet" name="fleet" value={formData.fleet} onChange={handleInputChange} readOnly={!isEditing} />
                                <FormGroup label="Sub Fleet" name="subFleet" value={formData.subFleet} onChange={handleInputChange} readOnly={!isEditing} />
                                <FormGroup label="Vessel Class" name="vesselClass" value={formData.vesselClass} onChange={handleInputChange} readOnly={!isEditing} />
                                <FormGroup label="IMO No" name="imoNo" value={formData.imoNo} onChange={handleInputChange} required readOnly={!isEditing} />
                                <FormGroup label="Registration Number" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} readOnly={!isEditing} />
                                <DateGroup label="Delivery Date" name="deliveryDate" value={formData.deliveryDate} onChange={handleInputChange} readOnly={!isEditing} />
                                <FormGroup label="Deadweight Tonnage" name="deadweightTonnage" value={formData.deadweightTonnage} onChange={handleInputChange} readOnly={!isEditing} />
                                <FormGroup label="Port of Registry" name="portOfRegistry" value={formData.portOfRegistry} onChange={handleInputChange} readOnly={!isEditing} />
                                <DateGroup label="SOC Expiry Date" name="socExpiryDate" value={formData.socExpiryDate} onChange={handleInputChange} readOnly={!isEditing} />
                            </div>

                            {/* Column 2 */}
                            <div className="form-column">
                                <FormGroup label="Type" name="type" value={formData.type} onChange={handleInputChange} readOnly={!isEditing} />
                                <FormGroup label="Ship Manager" name="shipManager" value={formData.shipManager} onChange={handleInputChange} readOnly={!isEditing} />
                                <FormGroup label="Registered Owner" name="registeredOwner" value={formData.registeredOwner} onChange={handleInputChange} readOnly={!isEditing} />
                                <FormGroup label="Flag State" name="flagState" value={formData.flagState} onChange={handleInputChange} readOnly={!isEditing} />
                                <FormGroup label="Vessel IHM Class" name="vesselIhmClass" value={formData.vesselIhmClass} onChange={handleInputChange} readOnly={!isEditing} />
                                <FormGroup label="Class ID No" name="classIdNo" value={formData.classIdNo} onChange={handleInputChange} readOnly={!isEditing} />
                                <FormGroup label="Name Of Yard" name="nameOfYard" value={formData.nameOfYard} onChange={handleInputChange} readOnly={!isEditing} />
                                <DateGroup label="Keel Laid Date" name="keelLaidDate" value={formData.keelLaidDate} onChange={handleInputChange} readOnly={!isEditing} />
                                <FormGroup label="TEU No of Units" name="teuUnits" value={formData.teuUnits} onChange={handleInputChange} readOnly={!isEditing} />
                                <FormGroup label="Initial IHM Reference" name="ihmReference" value={formData.ihmReference} onChange={handleInputChange} readOnly={!isEditing} />
                            </div>

                            {/* Column 3 */}
                            <div className="form-column">
                                <div className="image-upload-modern">
                                    <label>Vessel Image</label>
                                    <div
                                        className={`image-preview-container-modern ${!formData.image ? 'no-image' : ''} ${isDraggingFile ? 'dragging' : ''}`}
                                        onClick={isEditing ? triggerFileSelect : undefined}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        {formData.image ? (
                                            <>
                                                <img
                                                    key={formData.image || 'empty'}
                                                    src={formData.image}
                                                    alt="Vessel preview"
                                                />
                                                {isEditing && (
                                                    <div className="upload-overlay-modern">
                                                        <Plus size={24} />
                                                        <span>Change image</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="drag-drop-placeholder">
                                                <div className="upload-icon-circle">
                                                    <Upload size={32} />
                                                </div>
                                                <div className="upload-text">
                                                    <p className="main-text">Drag and drop file</p>
                                                    <p className="sub-text">or <span className="highlight">browse</span> from computer</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {isEditing && <span className="upload-hint">Note: Image should not exceed 10MB</span>}
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                                </div>

                                <FormGroup label="Signal Letters" name="signalLetters" value={formData.signalLetters} onChange={handleInputChange} readOnly={!isEditing} />
                                <FormGroup label="Builders unique id of ship" name="buildersUniqueId" value={formData.buildersUniqueId} onChange={handleInputChange} readOnly={!isEditing} />
                                <FormGroup label="Gross Tonnage" name="grossTonnage" value={formData.grossTonnage} onChange={handleInputChange} readOnly={!isEditing} />

                                <div className="radio-row-compact">
                                    <RadioGroup
                                        label="MD Standard"
                                        name="mdStandard"
                                        options={['HKC', 'EU']}
                                        value={formData.mdStandard}
                                        onChange={handleInputChange}
                                        readOnly={!isEditing}
                                    />

                                    <RadioGroup
                                        label="IHM Method"
                                        name="ihmMethod"
                                        options={['NB', 'ES']}
                                        value={formData.ihmMethod}
                                        onChange={handleInputChange}
                                        readOnly={!isEditing}
                                    />
                                </div>

                                <FormGroup label="SOC Reference" name="socReference" value={formData.socReference} onChange={handleInputChange} readOnly={!isEditing} />
                            </div>
                        </div>

                        <div className="vessel-form-actions-premium">
                            {!isEditing ? (
                                <button type="button" className="edit-btn-premium" onClick={() => setIsEditing(true)}>
                                    <Edit2 size={18} />
                                    <span>EDIT DETAILS</span>
                                </button>
                            ) : (
                                <div className="actions-group-premium">
                                    <button type="button" className="cancel-btn-premium" onClick={() => { setIsEditing(false); setIsAdding(false); setFormData(activeVesselData || INITIAL_VESSELS[0]); }}>
                                        CANCEL
                                    </button>
                                    <button type="submit" className="save-btn-premium">
                                        <Check size={18} />
                                        SAVE CHANGES
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="vessels-page-container">
            <Sidebar />
            <main className="vessel-page-main">
                <Header title="SHIPS AT PROJECT" />

                <div className="vessels-layout-wrapper">
                    <div className="vessels-top-nav">
                        <nav className="fleet-tabs-inline">
                            <div className="tabs-scroll-area">
                                {tabs.map((tab) => (
                                    <div
                                        key={tab.id}
                                        className={`tab-item-inline ${activeTab === tab.id ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        <tab.icon size={18} />
                                        <span>{tab.label}</span>
                                    </div>
                                ))}
                            </div>
                        </nav>
                    </div>

                    <div className="vessels-content-layout">
                        {/* Secondary Sidebar - Hidden on Decks & Documents tabs */}
                        {activeTab !== 'decks' && activeTab !== 'documents' && activeTab !== 'materials' && (
                            <aside className="secondary-sidebar">
                                {activeTab === 'purchase' ? (
                                    <>
                                        <div className="sidebar-filters-wrapper">
                                            <div className="sticky-filter-section">
                                                <div className="vessel-sidebar-filter card-style" onClick={() => setIsFilterExpanded(!isFilterExpanded)}>
                                                    <Filter size={14} />
                                                    <span>FILTER</span>
                                                    {isFilterExpanded ? <ChevronUp size={14} style={{ marginLeft: 'auto', color: '#64748b' }} /> : <ChevronDown size={14} style={{ marginLeft: 'auto', color: '#64748b' }} />}
                                                </div>

                                                {isFilterExpanded && (
                                                    <div className="sidebar-filter-content-direct">
                                                        <div className="filter-section">
                                                            <div className="filter-section-title">DATE RANGE</div>
                                                            <div className="filter-date-inputs">
                                                                <div className="filter-date-field">
                                                                    <label>FROM</label>
                                                                    <div className="date-input-with-icon">
                                                                        <input
                                                                            type="date"
                                                                            value={poFilterDateFrom}
                                                                            onChange={(e) => setPoFilterDateFrom(e.target.value)}
                                                                        />
                                                                        <Calendar size={14} className="calendar-icon-overlay" />
                                                                    </div>
                                                                </div>
                                                                <div className="filter-date-field">
                                                                    <label>TO</label>
                                                                    <div className="date-input-with-icon">
                                                                        <input
                                                                            type="date"
                                                                            value={poFilterDateTo}
                                                                            onChange={(e) => setPoFilterDateTo(e.target.value)}
                                                                        />
                                                                        <Calendar size={14} className="calendar-icon-overlay" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="filter-section">
                                                            <div className="filter-section-title">COMPLIANCE STATUS</div>
                                                            <div className="filter-radio-group">
                                                                <label className="filter-radio-item">
                                                                    <input
                                                                        type="radio"
                                                                        name="compliance"
                                                                        checked={poFilterCompliance === 'All'}
                                                                        onChange={() => setPoFilterCompliance('All')}
                                                                    />
                                                                    <span>All Statuses</span>
                                                                </label>
                                                                <label className="filter-radio-item">
                                                                    <input
                                                                        type="radio"
                                                                        name="compliance"
                                                                        checked={poFilterCompliance === 'Verified'}
                                                                        onChange={() => setPoFilterCompliance('Verified')}
                                                                    />
                                                                    <span>Verified</span>
                                                                </label>
                                                                <label className="filter-radio-item">
                                                                    <input
                                                                        type="radio"
                                                                        name="compliance"
                                                                        checked={poFilterCompliance === 'Not Verified'}
                                                                        onChange={() => setPoFilterCompliance('Not Verified')}
                                                                    />
                                                                    <span>Not Verified</span>
                                                                </label>
                                                                <label className="filter-radio-item">
                                                                    <input
                                                                        type="radio"
                                                                        name="compliance"
                                                                        checked={poFilterCompliance === 'MD Pending'}
                                                                        onChange={() => setPoFilterCompliance('MD Pending')}
                                                                    />
                                                                    <span>MD Pending</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="sidebar-dark-content-area">
                                            <div className="vessel-search-container dark-mode">
                                                <div className="vessel-search-box light">
                                                    <Search size={16} color="#94A3B8" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search vessels..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="vessel-list dark-mode" style={{ overflowY: 'auto' }}>
                                                {vesselList.filter(v =>
                                                    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    v.imoNo.includes(searchTerm)
                                                ).map((vessel) => (
                                                    <div
                                                        key={`${vessel.name}-${vessel.imoNo}`}
                                                        className={`vessel-item light ${activeVesselName === vessel.name ? 'active' : ''}`}
                                                        onClick={() => handleVesselSelect(vessel)}
                                                    >
                                                        <div className="vessel-status-dot v-active"></div>
                                                        <div className="vessel-info-block">
                                                            <h4>{vessel.name}</h4>
                                                            <p>IMO {vessel.imoNo}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="sidebar-list-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '8px' }}>
                                                    <button className="add-vessel-btn-refined" onClick={handleAddClick}>
                                                        <Plus size={18} />
                                                        Add Vessel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="sidebar-dark-content-area">
                                            <div className="vessel-search-container light-mode">
                                                <div className="vessel-search-box light">
                                                    <Search size={16} color="#94A3B8" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search vessels..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="vessel-list light-mode" style={{ overflowY: 'auto' }}>
                                                {vesselList.filter(v =>
                                                    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    v.imoNo.includes(searchTerm)
                                                ).map((vessel) => (
                                                    <div
                                                        key={`${vessel.name}-${vessel.imoNo}`}
                                                        className={`vessel-item light ${activeVesselName === vessel.name ? 'active' : ''}`}
                                                        onClick={() => handleVesselSelect(vessel)}
                                                    >
                                                        <div className="vessel-status-dot v-active"></div>
                                                        <div className="vessel-info-block">
                                                            <h4>{vessel.name}</h4>
                                                            <p>IMO {vessel.imoNo}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="sidebar-list-footer" style={{ borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: '8px' }}>
                                                    <button className="add-vessel-btn-refined" onClick={handleAddClick}>
                                                        <Plus size={18} />
                                                        Add Vessel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </aside>
                        )}

                        {/* Main Section */}
                        <div className="vessels-main">
                            <div className={`vessel-tab-content ${activeTab === 'purchase' ? 'no-scroll' : ''}`}>
                                {renderContent()}
                            </div>
                        </div>
                    </div>
                </div>
                {
                    showModal && (
                        <SuccessModal
                            message={modalMessage}
                            onClose={() => setShowModal(false)}
                        />
                    )
                }
            </main >
        </div >
    );
}

// Helper Components
const FormGroup = ({ label, name, value, onChange, required, readOnly }: { label: string, name: string, value: string, onChange: (e: any) => void, required?: boolean, readOnly?: boolean }) => (
    <div className="form-group-modern">
        <label>{label} {required && <span className="required">*</span>}</label>
        <input
            type="text"
            name={name}
            className={`form-control-modern ${readOnly ? 'read-only' : ''}`}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            placeholder={`Enter ${label.toLowerCase()}`}
        />
    </div>
);

const DateGroup = ({ label, name, value, onChange, readOnly }: { label: string, name: string, value: string, onChange: (e: any) => void, readOnly?: boolean }) => (
    <div className="form-group-modern">
        <label>{label}</label>
        <div className="date-input-wrapper-modern">
            <input
                type="date"
                name={name}
                className={`form-control-modern ${readOnly ? 'read-only' : ''}`}
                value={value}
                onChange={onChange}
                onKeyDown={(e) => e.preventDefault()}
                onClick={(e) => !readOnly && (e.target as HTMLInputElement).showPicker?.()}
                style={{ cursor: readOnly ? 'default' : 'pointer' }}
                readOnly={readOnly}
            />
            <Calendar className="date-icon-modern" size={16} />
        </div>
    </div>
);

const RadioGroup = ({ label, name, options, value, onChange, readOnly }: { label: string, name: string, options: string[], value: string, onChange: (e: any) => void, readOnly?: boolean }) => (
    <div className="form-group-modern">
        <label>{label}</label>
        <div className="radio-group-container">
            {options.map(opt => (
                <label key={opt} className={`radio-option ${readOnly ? 'disabled' : ''}`}>
                    <input
                        type="radio"
                        name={name}
                        value={opt}
                        checked={value === opt}
                        onChange={onChange}
                        disabled={readOnly}
                    />
                    <span className="radio-custom"></span>
                    <span className="radio-text">{opt}</span>
                </label>
            ))}
        </div>
    </div>
);

const SuccessModal = ({ message, onClose }: { message: string, onClose: () => void }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content success-card-modal">
            <div className="modal-success-icon">
                <Check size={40} />
            </div>
            <h2 className="modal-title">Success!</h2>
            <p className="modal-message">{message}</p>
            <button className="modal-action-btn" onClick={onClose}>
                DONE
            </button>
        </div>
    </div>
);
