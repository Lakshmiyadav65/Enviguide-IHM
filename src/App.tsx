import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vessels from './pages/Vessels';
import Fleet from './pages/Fleet';
import SubFleet from './pages/SubFleet';
import FullPlanViewer from './pages/FullPlanViewer';
import HazardousMaterialMapping from './pages/HazardousMaterialMapping';
import UploadPurchaseOrder from './pages/UploadPurchaseOrder';
import PendingAudits from './pages/PendingAudits';
import PendingReviews from './pages/PendingReviews';
import MDSdocAudit from './pages/MDSdocAudit';
import DocumentAudit from './pages/DocumentAudit';
import AuditReviewDetail from './pages/AuditReviewDetail';
import DocTab from './pages/DocTab';
import Registered from './pages/Registered';
import Ownership from './pages/Ownership';
import OwnershipManager from './pages/OwnershipManager';
import Supplier from './pages/Supplier';
import Equipment from './pages/Equipment';
import SuspectedKeyword from './pages/SuspectedKeyword';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vessels" element={<Vessels />} />
        <Route path="/vessels/ship" element={<Vessels />} />
        <Route path="/vessels/fleet" element={<Fleet />} />
        <Route path="/vessels/sub-fleet" element={<SubFleet />} />
        <Route path="/vessels/:id" element={<Vessels />} />
        <Route path="/decks" element={<Vessels />} />
        <Route path="/viewer" element={<FullPlanViewer />} />
        <Route path="/mapping" element={<HazardousMaterialMapping />} />
        <Route path="/materials" element={<Dashboard />} />
        <Route path="/purchase-orders" element={<Dashboard />} />
        <Route path="/administration" element={<Dashboard />} />
        <Route path="/administration/upload-po" element={<UploadPurchaseOrder />} />
        <Route path="/administration/pending-audits" element={<PendingAudits />} />
        <Route path="/administration/pending-reviews" element={<PendingReviews />} />
        <Route path="/administration/review-detail/:imo" element={<AuditReviewDetail />} />
        <Route path="/administration/md-sdoc-audit" element={<MDSdocAudit />} />
        <Route path="/administration/document-audit/:imo" element={<DocumentAudit />} />
        <Route path="/administration/upload-docs" element={<DocTab />} />
        <Route path="/security" element={<Dashboard />} />
        <Route path="/security/users" element={<Dashboard />} />
        <Route path="/security/user-profile" element={<Dashboard />} />
        <Route path="/security/user-menu" element={<Dashboard />} />
        <Route path="/security/user-rights" element={<Dashboard />} />
        <Route path="/security/user-role-rights" element={<Dashboard />} />
        <Route path="/security/user-category" element={<Dashboard />} />
        <Route path="/master-data" element={<Dashboard />} />
        <Route path="/inventory" element={<Dashboard />} />
        <Route path="/menu/registered" element={<Registered />} />
        <Route path="/menu/ownership" element={<Ownership />} />
        <Route path="/menu/ownership-manager" element={<OwnershipManager />} />
        <Route path="/menu/supplier" element={<Supplier />} />
        <Route path="/menu/equipment" element={<Equipment />} />
        <Route path="/menu/suspended" element={<Dashboard />} />
        <Route path="/menu/suspected-keyword" element={<SuspectedKeyword />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
