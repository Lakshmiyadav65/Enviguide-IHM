import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
    Search, Plus, Filter, Layers, FileText, ShoppingCart,
    BarChart2, FileCheck, ShieldCheck, Check, Edit2, X,
    FolderOpen, Ship as ShipIcon, Pin, Upload, Eye, Trash2, Calendar, ChevronDown, ChevronUp,
    Download, AlertTriangle, ExternalLink, ChevronLeft, ChevronRight, Book, RotateCw, Monitor, Paperclip, GripVertical, EyeOff, ZoomIn, ZoomOut, Maximize2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './Vessels.css';
import MaterialsRecord from './MaterialsRecord';
import PurchaseOrderView from './PurchaseOrderView';
import DecksView from './DecksView';
import IHMCertificateView from './IHMCertificateView';
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
    const [notifCount, setNotifCount] = useState(3);
    const [vesselList, setVesselList] = useState<VesselData[]>(INITIAL_VESSELS);
    const [activeVesselName, setActiveVesselName] = useState('MV Ocean Pioneer');
    const [activeTab, setActiveTab] = useState(location.pathname === '/decks' ? 'decks' : 'project');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);

    // Document & Form States
    const [docSearch, setDocSearch] = useState('');
    const [docCategory, setDocCategory] = useState('All');
    const [docStatus, setDocStatus] = useState('All');
    const [docPage, setDocPage] = useState(1);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [newDocType, setNewDocType] = useState('Select Document Type');
    const docsPerPage = 10;

    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const [formData, setFormData] = useState<VesselData>(INITIAL_VESSELS[0]);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [docToDelete, setDocToDelete] = useState<any>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Reports Flow States
    const [reportStep, setReportStep] = useState(0); // 0: Selection, 1: Configuration, 2: Editor
    const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
    const [selectedReportCategory, setSelectedReportCategory] = useState<string | null>(null);
    const [selectedSections, setSelectedSections] = useState<string[]>([]);
    const [hiddenSections, setHiddenSections] = useState<string[]>([]);
    const [reorderedSections, setReorderedSections] = useState<any[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    // Custom Dropdown States & Refs
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

        // Lock body scroll for this page
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = '';
        };
    }, []);

    // Purchase Order Filters Lifted State
    const [poFilterDateFrom, setPoFilterDateFrom] = useState('');
    const [poFilterDateTo, setPoFilterDateTo] = useState('');
    const [poFilterCompliance, setPoFilterCompliance] = useState('All');

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Scroll effect for report blurred cards (Accordion cards in Step 0)
    useEffect(() => {
        const handleScroll = () => {
            const container = scrollContainerRef.current;
            if (!container) return;

            const cards = container.querySelectorAll('.report-accordion-group');
            const containerRect = container.getBoundingClientRect();
            const containerBottom = containerRect.bottom;
            const scrollHeight = container.scrollHeight;
            const scrollTop = container.scrollTop;
            const clientHeight = container.clientHeight;

            const isAtBottom = scrollHeight - (scrollTop + clientHeight) < 10;

            cards.forEach((card) => {
                const rect = (card as HTMLElement).getBoundingClientRect();
                const cardBottom = rect.bottom;
                const distanceToBottom = containerBottom - cardBottom;

                // If we are at the very bottom, remove all blur
                if (isAtBottom) {
                    (card as HTMLElement).style.filter = 'none';
                    (card as HTMLElement).style.opacity = '1';
                    (card as HTMLElement).style.transform = 'scale(1)';
                    return;
                }

                // Identify the "last few" cards based on proximity to container bottom
                // We want the last 2 visible cards to be blurry
                if (distanceToBottom < 100 && distanceToBottom > -50) {
                    const blurAmount = Math.max(0, (100 - distanceToBottom) / 20);
                    const opacityAmount = Math.max(0.6, distanceToBottom / 100);
                    (card as HTMLElement).style.filter = `blur(${blurAmount}px)`;
                    (card as HTMLElement).style.opacity = `${opacityAmount}`;
                    (card as HTMLElement).style.transform = `scale(${0.98 + (distanceToBottom / 5000)})`;
                } else if (distanceToBottom <= -50) {
                    // Elements below the viewport bottom
                    (card as HTMLElement).style.filter = 'blur(8px)';
                    (card as HTMLElement).style.opacity = '0';
                } else {
                    (card as HTMLElement).style.filter = 'none';
                    (card as HTMLElement).style.opacity = '1';
                    (card as HTMLElement).style.transform = 'scale(1)';
                }
            });
        };

        const container = scrollContainerRef.current;
        if (activeTab === 'reports' && reportStep === 0 && container) {
            container.addEventListener('scroll', handleScroll);
            // Trigger once to set initial state
            handleScroll();
        } else if (container) {
            // Reset all cards if we leave reports or move to config step
            const cards = container.querySelectorAll('.report-accordion-group');
            cards.forEach((card) => {
                (card as HTMLElement).style.filter = 'none';
                (card as HTMLElement).style.opacity = '1';
                (card as HTMLElement).style.transform = 'scale(1)';
            });
        }
        return () => container?.removeEventListener('scroll', handleScroll);
    }, [activeTab, reportStep]);

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

    // State management handles consolidated above


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
        { id: 'certificate', label: 'IHM Certificate', icon: ShieldCheck },
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
            return (
                <PurchaseOrderView key={activeVesselName} />
            );
        }

        if (activeTab === 'materials') {
            return <MaterialsRecord key={activeVesselName} vesselName={activeVesselName} />;
        }

        if (activeTab === 'reports') {
            const vesselDisplayName = activeVesselName.includes(' ') ? activeVesselName.split(' ')[1].toUpperCase() : activeVesselName.toUpperCase();

            const reportCategories = [
                {
                    id: 'adhoc',
                    title: 'AD HOC REPORT',
                    items: [
                        { id: 'summary', name: 'Compliance Summary Report', date: 'Last updated: Oct 24, 2023' },
                        { id: 'inventory', name: 'Detailed Materials Inventory Report', date: 'Last updated: Oct 12, 2023' },
                        { id: 'hazmat', name: 'Global Hazmat Overview Report', date: 'Last updated: Nov 05, 2023' },
                    ]
                },
                { id: 'q1_2026', title: 'Q1 (01/01/2026 - 31/03/2026)', items: [{ id: 'q1_26_1', name: 'Quarterly Compliance Report', date: 'Last updated: Feb 01, 2026' }] },
                { id: 'q4_2025', title: 'Q4 (01/10/2025 - 31/12/2025)', items: [{ id: 'q4_25_1', name: 'Quarterly Compliance Report', date: 'Last updated: Jan 05, 2026' }] },
                { id: 'q3_2025', title: 'Q3 (01/07/2025 - 30/09/2025)', items: [{ id: 'q3_25_1', name: 'Quarterly Compliance Report', date: 'Last updated: Oct 10, 2025' }] },
                { id: 'q2_2025', title: 'Q2 (01/04/2025 - 30/06/2025)', items: [{ id: 'q2_25_1', name: 'Quarterly Compliance Report', date: 'Last updated: Jul 15, 2025' }] },
                { id: 'q1_2025', title: 'Q1 (01/01/2025 - 31/03/2025)', items: [{ id: 'q1_25_1', name: 'Quarterly Compliance Report', date: 'Last updated: Apr 10, 2025' }] },
                { id: 'q4_2024', title: 'Q4 (01/10/2024 - 31/12/2024)', items: [{ id: 'q4_24_1', name: 'Quarterly Compliance Report', date: 'Last updated: Jan 12, 2025' }] },
                { id: 'q3_2024', title: 'Q3 (01/07/2024 - 30/09/2024)', items: [{ id: 'q3_24_1', name: 'Quarterly Compliance Report', date: 'Last updated: Oct 15, 2024' }] },
                { id: 'q2_2024', title: 'Q2 (01/04/2024 - 30/06/2024)', items: [{ id: 'q2_24_1', name: 'Quarterly Compliance Report', date: 'Last updated: Jul 20, 2024' }] },
                { id: 'q1_2024', title: 'Q1 (01/01/2024 - 31/03/2024)', items: [{ id: 'q1_24_1', name: 'Quarterly Compliance Report', date: 'Last updated: Apr 18, 2024' }] },
                { id: 'q4_2023', title: 'Q4 (01/10/2023 - 31/12/2023)', items: [{ id: 'q4_23_1', name: 'Quarterly Compliance Report', date: 'Last updated: Jan 22, 2024' }] },
                { id: 'q3_2023', title: 'Q3 (01/07/2023 - 30/09/2023)', items: [{ id: 'q3_23_1', name: 'Quarterly Compliance Report', date: 'Last updated: Oct 25, 2023' }] },
                { id: 'q2_2023', title: 'Q2 (01/04/2023 - 30/06/2023)', items: [{ id: 'q2_23_1', name: 'Quarterly Compliance Report', date: 'Last updated: Jul 28, 2023' }] },
                { id: 'q1_2023', title: 'Q1 (01/01/2023 - 31/03/2023)', items: [{ id: 'q1_23_1', name: 'Quarterly Compliance Report', date: 'Last updated: Apr 30, 2023' }] },
                { id: 'q4_2022', title: 'Q4 (01/10/2022 - 31/12/2022)', items: [{ id: 'q4_22_1', name: 'Quarterly Compliance Report', date: 'Last updated: Jan 15, 2023' }] },
                { id: 'q3_2022', title: 'Q3 (01/07/2022 - 30/09/2022)', items: [{ id: 'q3_22_1', name: 'Quarterly Compliance Report', date: 'Last updated: Oct 20, 2022' }] },
                { id: 'q2_2022', title: 'Q2 (01/04/2022 - 30/06/2022)', items: [{ id: 'q2_22_1', name: 'Quarterly Compliance Report', date: 'Last updated: Jul 25, 2022' }] },
                { id: 'q1_2022', title: 'Q1 (01/01/2022 - 31/03/2022)', items: [{ id: 'q1_22_1', name: 'Quarterly Compliance Report', date: 'Last updated: Apr 28, 2022' }] },
                { id: 'q4_2021', title: 'Q4 (01/10/2021 - 31/12/2021)', items: [{ id: 'q4_21_1', name: 'Quarterly Compliance Report', date: 'Last updated: Jan 18, 2022' }] },
                { id: 'q3_2021', title: 'Q3 (01/07/2021 - 30/09/2021)', items: [{ id: 'q3_21_1', name: 'Quarterly Compliance Report', date: 'Last updated: Oct 22, 2021' }] },
                { id: 'q2_2021', title: 'Q2 (01/04/2021 - 30/06/2021)', items: [{ id: 'q2_21_1', name: 'Quarterly Compliance Report', date: 'Last updated: Jul 25, 2021' }] },
            ];

            const SECTIONS_LIST = [
                { id: 'intro', title: 'Introduction', hasView: true },
                { id: 'specs', title: 'Vessel Specifications', hasView: true },
                { id: 'index', title: 'Index', hasView: true },
                { id: 'mov', title: 'IHM Movement', hasView: true },
                { id: 'haz', title: 'Ship Hazmat Overview', hasView: true },
                { id: 'details', title: 'IHM Details', hasView: true },
                { id: 'decks', title: 'HM Marked Decks', hasView: true },
                { id: 'doc', title: 'IHM Document', hasView: true },
                { id: 'f1', title: '9371543_CLODOMIRA_IHM Attestation Letter', hasView: true },
                { id: 'f2', title: 'CLODOMIRA-IHM-002699', hasView: true },
                { id: 'f3', title: '2020-12-01-ihm-report-compressed', hasView: true },
                { id: 'f4', title: 'ACOSTA-IHM-004122_FULL TERM', hasView: true },
                { id: 'f5', title: 'Anti-fouling Certificate', hasView: true },
                { id: 'f6', title: '_ACOSTA-IHM-FULL TERM NEW ISSUED', hasView: true },
                { id: 'other', title: 'Other', hasView: true }
            ];

            const toggleSection = (id: string) => {
                if (selectedSections.includes(id)) {
                    setSelectedSections(selectedSections.filter(s => s !== id));
                } else {
                    setSelectedSections([...selectedSections, id]);
                }
            };

            if (reportStep === 0 || reportStep === 1) {
                return (
                    <div className="reports-accordion-wrapper" ref={scrollContainerRef}>
                        {reportCategories.map((cat) => {
                            const isCategoryConfiguring = reportStep === 1 && selectedReportCategory === cat.id;
                            // Only expand if it's the selected category. ADHOC is no longer forced open.
                            const isExpanded = selectedReportCategory === cat.id;

                            return (
                                <div key={cat.id} className={`report-accordion-group ${isExpanded ? 'expanded' : ''}`}>
                                    <div
                                        className="report-accordion-header"
                                        onClick={() => {
                                            if (reportStep === 1 && selectedReportCategory === cat.id) {
                                                setReportStep(0);
                                                setSelectedReportCategory(null);
                                            } else {
                                                setSelectedReportCategory(isExpanded ? null : cat.id);
                                            }
                                        }}
                                    >
                                        <Monitor size={18} color="#00B0FA" />
                                        <h3>{cat.title}</h3>
                                        <ChevronDown size={14} className="accordion-arrow" />
                                    </div>
                                    {isExpanded && (
                                        <div className="report-accordion-content">
                                            {isCategoryConfiguring ? (
                                                <div className="designer-report-config-form">
                                                    <div className="config-form-top-row">
                                                        <div className="designer-field-group">
                                                            <label>From Date *</label>
                                                            <div className="designer-input-box">
                                                                <input type="date" defaultValue="2021-05-15" />
                                                            </div>
                                                            <span className="field-helper">MM/DD/YYYY</span>
                                                        </div>
                                                        <div className="designer-field-group">
                                                            <label>To Date *</label>
                                                            <div className="designer-input-box">
                                                                <input type="date" defaultValue="2026-02-04" />
                                                            </div>
                                                            <span className="field-helper">MM/DD/YYYY</span>
                                                        </div>
                                                    </div>

                                                    <div className="designer-file-row">
                                                        <label>Choose file</label>
                                                        <div className="file-selection-bar" onClick={() => docInputRef.current?.click()}>
                                                            <div className="file-display-area">
                                                                <Paperclip size={18} color="#94A3B8" />
                                                                <span style={{ fontSize: '13px', color: '#64748B', marginLeft: '8px' }}>
                                                                    {selectedFile ? selectedFile.name : 'No file selected'}
                                                                </span>
                                                            </div>
                                                            <button className="designer-upload-btn" type="button">
                                                                <Upload size={18} />
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="file"
                                                            ref={docInputRef}
                                                            style={{ display: 'none' }}
                                                            onChange={handleDocFileChange}
                                                        />
                                                    </div>

                                                    <div className="designer-sections-table">
                                                        <div className="sections-table-header">
                                                            <span className="col-sections">Sections</span>
                                                            <span className="col-include">INCLUDE</span>
                                                        </div>
                                                        <div className="sections-table-body">
                                                            {SECTIONS_LIST.map(sec => (
                                                                <div key={sec.id} className="section-table-row">
                                                                    <div className="section-name-cell">
                                                                        <span>{sec.title}</span>
                                                                        {sec.hasView && (
                                                                            <button
                                                                                type="button"
                                                                                className="action-icn-btn minimal"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (hiddenSections.includes(sec.id)) {
                                                                                        setHiddenSections(hiddenSections.filter(h => h !== sec.id));
                                                                                    } else {
                                                                                        setHiddenSections([...hiddenSections, sec.id]);
                                                                                    }
                                                                                }}
                                                                                title="Toggle visibility"
                                                                            >
                                                                                {hiddenSections.includes(sec.id) ? <EyeOff size={14} color="#EF4444" /> : <Eye size={14} className="view-icon-dim" />}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <div className="section-checkbox-cell">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedSections.includes(sec.id)}
                                                                            onChange={() => toggleSection(sec.id)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="designer-form-footer">
                                                        <button
                                                            className="preview-btn-designer"
                                                            onClick={() => {
                                                                const currentSections = SECTIONS_LIST.filter(sec =>
                                                                    selectedSections.includes(sec.id) && !hiddenSections.includes(sec.id)
                                                                );
                                                                setReorderedSections(currentSections);
                                                                setReportStep(2);
                                                            }}
                                                        >
                                                            <Eye size={18} />
                                                            PREVIEW REPORT
                                                        </button>
                                                        <button
                                                            className="generate-btn-designer"
                                                            onClick={() => {
                                                                const currentSections = SECTIONS_LIST.filter(sec =>
                                                                    selectedSections.includes(sec.id) && !hiddenSections.includes(sec.id)
                                                                );
                                                                setReorderedSections(currentSections);
                                                                setReportStep(2);
                                                            }}
                                                        >
                                                            <RotateCw size={18} />
                                                            GENERATE REPORT
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="report-items-list">
                                                    {cat.items.length > 0 ? (
                                                        cat.items.map((item) => (
                                                            <div key={item.id} className="report-item-card-premium">
                                                                <div className="report-item-icon-box">
                                                                    <FileText size={24} color="#94A3B8" />
                                                                </div>
                                                                <div className="report-item-info">
                                                                    <div className="report-item-name">{item.name}</div>
                                                                    <div className="report-item-meta">{item.date}</div>
                                                                </div>
                                                                <div className="report-action-btns">
                                                                    <button
                                                                        className="generate-btn-final"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedReportType(item.name);
                                                                            setSelectedReportCategory(cat.id);
                                                                            setReportStep(1);
                                                                        }}
                                                                    >
                                                                        <RotateCw size={16} />
                                                                        GENERATE
                                                                    </button>
                                                                    <button className="download-btn-final" onClick={(e) => e.stopPropagation()}>
                                                                        <Download size={16} />
                                                                        DOWNLOAD
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="empty-category-msg">No reports found for this criteria.</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            }

            // STEP 2: REPORT PREVIEW (As per user request, reorder structure is hidden for now)
            return (
                <div className="reports-final-output-wrapper">
                    {/* Sub-header with Title - Meta and Edit Config removed as per user request */}
                    <div className="report-sub-header-premium">
                        <div className="sub-title-main">
                            <Book size={24} className="editor-icon" />
                            <h2>Report Structure Editor</h2>
                        </div>
                    </div>

                    <div className="report-editor-layout">
                        {/* Left Sidebar: Draggable Structure */}
                        <div className="report-structure-sidebar">
                            <div className="sidebar-header-row">
                                <h3>DRAG TO REORDER SECTIONS</h3>
                                <button className="add-sec-btn-text">ADD SECTION</button>
                            </div>

                            <div className="draggable-sections-list">
                                {reorderedSections.length > 0 ? (
                                    reorderedSections.map((sec, idx) => (
                                        <div
                                            key={sec.id}
                                            className={`draggable-section-card ${draggedIndex === idx ? 'dragging' : ''}`}
                                            draggable
                                            onDragStart={(e) => {
                                                setDraggedIndex(idx);
                                                e.dataTransfer.effectAllowed = 'move';
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                if (draggedIndex === null || draggedIndex === idx) return;
                                                const newSections = [...reorderedSections];
                                                const itemToMove = newSections[draggedIndex];
                                                newSections.splice(draggedIndex, 1);
                                                newSections.splice(idx, 0, itemToMove);
                                                setDraggedIndex(idx);
                                                setReorderedSections(newSections);
                                            }}
                                            onDragEnd={() => setDraggedIndex(null)}
                                        >
                                            <div className="card-grab-handle">
                                                <GripVertical size={16} color="#94A3B8" />
                                            </div>
                                            <div className="card-title-txt">{sec.title}</div>
                                            <div
                                                className="card-visibility-icn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newReordered = reorderedSections.filter(s => s.id !== sec.id);
                                                    setReorderedSections(newReordered);
                                                    setHiddenSections([...hiddenSections, sec.id]);
                                                }}
                                                style={{ cursor: 'pointer' }}
                                                title="Hide section"
                                            >
                                                <Eye size={16} color="#94A3B8" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-selection-msg">No sections selected for preview.</div>
                                )}
                            </div>

                            <div className="sidebar-footer-actions">
                                <button className="reset-order-btn" onClick={() => {
                                    const original = SECTIONS_LIST.filter(sec =>
                                        selectedSections.includes(sec.id) && !hiddenSections.includes(sec.id)
                                    );
                                    setReorderedSections(original);
                                }}>RESET ORDER</button>
                            </div>
                        </div>

                        {/* Right: Preview Pane */}
                        <div className="report-main-preview-area">
                            {/* Centered Mock Paper Document */}
                            <div className="preview-pane-standalone">
                                <div className="pane-header-actions">
                                    <div className="preview-tag">
                                        <FileText size={18} className="preview-icon-small" />
                                        <h3>Live Preview: {selectedReportType || 'Report Overview'}</h3>
                                    </div>
                                    <div className="preview-controls-overlay">
                                        <span className="page-indicator">Page 1 of 12</span>
                                        <div className="zoom-btns">
                                            <button className="zoom-btn"><ZoomOut size={16} /></button>
                                            <button className="zoom-btn"><ZoomIn size={16} /></button>
                                            <button className="zoom-btn"><Maximize2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>

                                <div className="paper-viewer-container">
                                    <div className="mock-paper-document">
                                        <div className="paper-header">
                                            <div className="paper-logo-icon">
                                                <ShipIcon size={32} />
                                            </div>
                                            <div className="confidential-mark">
                                                <span>STRICTLY CONFIDENTIAL</span>
                                                <small>Ref: VS-{vesselDisplayName}-2024-001</small>
                                            </div>
                                        </div>

                                        <h1 className="paper-title">{selectedReportType || 'Ship Hazmat Overview'}</h1>

                                        <p className="paper-intro-text">
                                            The following overview outlines the distribution and concentration of
                                            hazardous materials identified during the most recent IHM survey for the
                                            vessel <strong>{activeVesselName} (IMO: {activeVesselData?.imoNo || '9371543'})</strong>.
                                        </p>

                                        <div className="summary-boxes-row">
                                            <div className="summary-box">
                                                <span className="box-label">TOTAL ITEMS LOGGED</span>
                                                <span className="box-value">124 Samples</span>
                                            </div>
                                            <div className="summary-box accent">
                                                <span className="box-label">ACTIVE HAZARDS</span>
                                                <span className="box-value">12 Locations</span>
                                            </div>
                                        </div>

                                        <div className="hazmat-table-mock">
                                            <div className="table-header">
                                                <span>HAZMAT CODE</span>
                                                <span>LOCATION</span>
                                                <span>STATUS</span>
                                            </div>
                                            <div className="table-row">
                                                <span>Asbestos (Table A)</span>
                                                <span>Engine Room - Gasket</span>
                                                <span className="status-pos">Positive</span>
                                            </div>
                                            <div className="table-row">
                                                <span>PCBs (Table A)</span>
                                                <span>Main Deck - Paint</span>
                                                <span className="status-neg">Negative</span>
                                            </div>
                                            <div className="table-row">
                                                <span>Ozone Depleting</span>
                                                <span>A/C Plant 2</span>
                                                <span className="status-trace">Trace</span>
                                            </div>
                                        </div>

                                        <div className="paper-footer-note">
                                            Note: All findings are subject to regular quarterly inspections and should be cross-referenced with the Movement Log on page 7.
                                        </div>

                                        <div className="paper-bottom-meta">
                                            <span>Varuna Sentinels | IHM Compliance Report</span>
                                            <span>Page 1 of 12</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pane-footer-actions">
                                    <button className="save-draft-btn-plain">SAVE DRAFT</button>
                                    <button className="finalize-export-btn">
                                        <Layers size={18} /> FINALIZE & EXPORT
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="vessel-status-bar">
                        <div className="status-left">
                            <div className="status-dot dot-online"></div>
                            <span>System Online</span>
                        </div>
                        <div className="status-right">
                            <span>© 2024 Varuna Sentinels. All rights reserved.</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'certificate') {
            return (
                <IHMCertificateView
                    key={activeVesselName}
                    vesselName={activeVesselName}
                    onCertificateSubmit={() => setNotifCount(prev => prev + 1)}
                />
            );
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
                                                <div className="custom-upload-animation">
                                                    <div className="animated-circle">
                                                        <div className="inverted-v-divider">
                                                            <div className="v-line left"></div>
                                                            <div className="v-line right"></div>
                                                        </div>
                                                    </div>
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
                <Header notificationCount={notifCount} />

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
                        {/* Secondary Sidebar - Hidden on Purchase, Decks, Documents, Materials, Certificate & Reports tabs */}
                        {activeTab !== 'decks' && activeTab !== 'documents' && activeTab !== 'materials' && activeTab !== 'certificate' && activeTab !== 'reports' && activeTab !== 'purchase' && (
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

                                            <div className="vessel-list dark-mode" style={{ flex: 1, overflowY: 'auto' }}>
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
                                            </div>
                                            <div className="sidebar-list-footer">
                                                <button className="add-vessel-btn-refined" onClick={handleAddClick}>
                                                    <Plus size={18} />
                                                    Add Vessel
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="sidebar-section-header">
                                            <span>VESSEL SELECTION</span>
                                            <Search size={14} style={{ cursor: 'pointer', color: '#64748B' }} />
                                        </div>
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

                                        <div className="vessel-list light-mode" style={{ flex: 1, overflowY: 'auto' }}>
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
                                        </div>
                                        <div className="sidebar-list-footer">
                                            <button className="add-vessel-btn-refined" onClick={handleAddClick}>
                                                <Plus size={18} />
                                                Add Vessel
                                            </button>
                                        </div>
                                    </>
                                )}
                            </aside>
                        )}

                        <div className="vessels-main">
                            <div className={`vessel-tab-content ${(activeTab === 'reports' && reportStep === 2) ? 'no-scroll no-padding' : ''}`}>
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
function FormGroup({ label, name, value, onChange, required, readOnly }: { label: string, name: string, value: string, onChange: (e: any) => void, required?: boolean, readOnly?: boolean }) {
    return (
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
}

function DateGroup({ label, name, value, onChange, readOnly }: { label: string, name: string, value: string, onChange: (e: any) => void, readOnly?: boolean }) {
    const [showCalendar, setShowCalendar] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);

    // Check if browser supports :has(), otherwise we might need global class handling, but inline style works for z-index

    const parseDate = (val: string | null) => {
        if (!val) return null;
        const d = new Date(val);
        return !isNaN(d.getTime()) ? d : null;
    };

    const initialDate = parseDate(value);
    const [viewDate, setViewDate] = useState(initialDate || new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
    const containerRef = useRef<HTMLDivElement>(null);
    const yearsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const parsed = parseDate(value);
        setSelectedDate(parsed);
        if (parsed) {
            setViewDate(parsed);
        }
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowCalendar(false);
                setShowYearPicker(false);
                setShowMonthPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Auto-scroll year picker
    useEffect(() => {
        if (showYearPicker && yearsContainerRef.current) {
            const currentYearEl = yearsContainerRef.current.querySelector('.year-cell.current');
            if (currentYearEl) {
                currentYearEl.scrollIntoView({ block: 'center', behavior: 'auto' });
            }
        }
    }, [showYearPicker]);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!readOnly) {
            setShowCalendar(prev => !prev);
            setShowYearPicker(false);
            setShowMonthPicker(false);
        }
    };

    const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const startDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleYearChange = (year: number) => {
        setViewDate(new Date(year, viewDate.getMonth(), 1));
        setShowYearPicker(false);
        // Optional: switch to month picker after year? keeping to day view for efficiency unless requested
        // User asked "Ask user about the month then ask them about the day" - maybe go to Month picker?
        // Let's go to Month picker for better flow
        setShowMonthPicker(true);
    };

    const handleMonthChange = (monthIndex: number) => {
        setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
        setShowMonthPicker(false);
    };

    const handleSelectDate = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        setSelectedDate(newDate);
        setShowCalendar(false);

        const yyyy = newDate.getFullYear();
        const mm = String(newDate.getMonth() + 1).padStart(2, '0');
        const dd = String(newDate.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        // Simulate full event to prevent crashes in parent handlers
        const syntheticEvent = {
            target: { name, value: dateStr },
            preventDefault: () => { },
            stopPropagation: () => { },
            persist: () => { }
        };

        onChange(syntheticEvent);
    };

    const formatDateDisplay = (date: Date | null) => {
        if (!date) return "";
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd} - ${mm} - ${yyyy}`;
    };

    const renderYearPicker = () => {
        const currentYear = viewDate.getFullYear();
        // Generate years 1900 to 2100
        const years = Array.from({ length: 201 }, (_, i) => 1900 + i);

        return (
            <div className="year-picker-grid">
                <div className="year-picker-header">Select Year</div>
                <div className="years-container" ref={yearsContainerRef}>
                    {years.map(y => (
                        <div
                            key={y}
                            className={`year-cell ${y === currentYear ? 'current' : ''}`}
                            onClick={(e) => { e.stopPropagation(); handleYearChange(y); }}
                        >
                            {y}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderMonthPicker = () => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentMonth = viewDate.getMonth();

        return (
            <div className="month-picker-grid">
                <div className="year-picker-header">Select Month</div>
                <div className="months-container">
                    {monthNames.map((m, idx) => (
                        <div
                            key={m}
                            className={`month-cell ${idx === currentMonth ? 'current' : ''}`}
                            onClick={(e) => { e.stopPropagation(); handleMonthChange(idx); }}
                        >
                            {m}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderCalendar = () => {
        const month = viewDate.getMonth();
        const year = viewDate.getFullYear();
        const days = [];
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        const offset = startDayOfMonth(month, year);
        for (let i = 0; i < offset; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        const totalDays = daysInMonth(month, year);
        for (let d = 1; d <= totalDays; d++) {
            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
            const isSelected = selectedDate?.toDateString() === new Date(year, month, d).toDateString();
            days.push(
                <div
                    key={d}
                    className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleSelectDate(d); }}
                >
                    {d}
                </div>
            );
        }

        return (
            <div className="innovative-calendar-popup" onClick={(e) => e.stopPropagation()}>
                {showYearPicker ? renderYearPicker() : showMonthPicker ? renderMonthPicker() : (
                    <>
                        <div className="calendar-header-premium">
                            <button type="button" onClick={(e) => { e.stopPropagation(); handlePrevMonth(); }} className="nav-btn-cal"><ChevronLeft size={16} /></button>
                            <div className="month-year-display">
                                <span
                                    className="cal-month clickable"
                                    onClick={(e) => { e.stopPropagation(); setShowMonthPicker(true); }}
                                    title="Click to change month"
                                >
                                    {monthNames[month]}
                                </span>
                                <div
                                    className="cal-year-badge clickable"
                                    onClick={(e) => { e.stopPropagation(); setShowYearPicker(true); }}
                                    title="Click to change year"
                                >
                                    {year}
                                </div>
                            </div>
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleNextMonth(); }} className="nav-btn-cal"><ChevronRight size={16} /></button>
                        </div>
                        <div className="calendar-weekdays">
                            {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(wd => <span key={wd}>{wd}</span>)}
                        </div>
                        <div className="calendar-grid-premium">
                            {days}
                        </div>
                        <div className="calendar-footer-cal">
                            <button
                                type="button"
                                className="today-btn-cal"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const now = new Date();
                                    setViewDate(now);
                                    handleSelectDate(now.getDate());
                                }}
                            >
                                Go to Today
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div
            className="form-group-modern"
            ref={containerRef}
            style={{ zIndex: showCalendar ? 100 : 'auto', position: 'relative' }} /* Fix overlap */
        >
            <label>{label}</label>
            <div className="date-input-wrapper-modern">
                <div
                    className={`custom-date-field ${readOnly ? 'read-only' : ''} ${showCalendar ? 'active' : ''}`}
                    onClick={handleToggle}
                >
                    <span className={`date-value-text ${!selectedDate ? 'placeholder' : ''}`}>
                        {selectedDate ? formatDateDisplay(selectedDate) : `Select ${label.toLowerCase()}`}
                    </span>
                    <div
                        className="orbital-cal-indicator"
                        onClick={handleToggle}
                    >
                        <Calendar size={16} />
                    </div>
                </div>
                {!readOnly && showCalendar && renderCalendar()}
            </div>
        </div>
    );
}

function RadioGroup({ label, name, options, value, onChange, readOnly }: { label: string, name: string, options: string[], value: string, onChange: (e: any) => void, readOnly?: boolean }) {
    return (
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
}

function SuccessModal({ message, onClose }: { message: string, onClose: () => void }) {
    return (
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
}
