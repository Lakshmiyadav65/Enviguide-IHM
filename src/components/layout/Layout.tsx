import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [selectedVessel, setSelectedVessel] = useState<string | null>('1'); // Default to first vessel

    return (
        <div className="layout">
            <Sidebar selectedVessel={selectedVessel} onVesselSelect={setSelectedVessel} />
            <div className="main-wrapper">
                <Header selectedVessel={selectedVessel} />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
