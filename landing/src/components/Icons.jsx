// 20×20 line icons used in the nav dropdowns (16px) and feature cards (20px).
function LineIcon({ size = 16, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      {children}
    </svg>
  )
}

export const ClockIcon = ({ size }) => (
  <LineIcon size={size}>
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </LineIcon>
)

export const HouseIcon = ({ size }) => (
  <LineIcon size={size}>
    <path d="M4 15V8l6-5 6 5v7H4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <rect x="7" y="11" width="6" height="4" stroke="currentColor" strokeWidth="1.5" />
  </LineIcon>
)

export const DocumentIcon = ({ size }) => (
  <LineIcon size={size}>
    <path d="M6 2h8l4 4v12H2V2h4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M6 11h8M6 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </LineIcon>
)

export const UserIcon = ({ size }) => (
  <LineIcon size={size}>
    <circle cx="10" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 18c0-4 3-6 7-6s7 2 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </LineIcon>
)

export const ReportIcon = ({ size }) => (
  <LineIcon size={size}>
    <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 10h8M6 13h5M6 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </LineIcon>
)

export const GridIcon = ({ size }) => (
  <LineIcon size={size}>
    <rect x="2" y="3" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11" y="3" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11" y="11" width="7" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="2" y="14" width="7" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
  </LineIcon>
)

export const TankerIcon = ({ size }) => (
  <LineIcon size={size}>
    <path d="M3 13h14l-2-6H5L3 13z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M3 13l-1 3h16l-1-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </LineIcon>
)

export const ContainerIcon = ({ size }) => (
  <LineIcon size={size}>
    <rect x="2" y="6" width="16" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 6V4h10v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </LineIcon>
)

export const OffshoreIcon = ({ size }) => (
  <LineIcon size={size}>
    <path d="M2 14l8-10 8 10H2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </LineIcon>
)

export const BookIcon = ({ size }) => (
  <LineIcon size={size}>
    <path d="M5 2h10v16H5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M8 6h4M8 9h4M8 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </LineIcon>
)

export const ArticleIcon = ({ size }) => (
  <LineIcon size={size}>
    <path d="M4 2h12v16H4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M7 7h6M7 10h6M7 13h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </LineIcon>
)

export const InfoIcon = ({ size }) => (
  <LineIcon size={size}>
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 9v5M10 7h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </LineIcon>
)

export const StarIcon = ({ size }) => (
  <LineIcon size={size}>
    <path
      d="M10 3l1.5 4.5H16l-3.5 2.5 1.5 4.5L10 12l-4 2.5 1.5-4.5L4 7.5h4.5L10 3z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
    />
  </LineIcon>
)

export const UsersIcon = ({ size }) => (
  <LineIcon size={size}>
    <circle cx="7" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="14" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 17c0-3 2-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 10c2 0 4 1 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </LineIcon>
)

export const ChevronIcon = () => (
  <svg className="chevron" width="12" height="12" viewBox="0 0 12 12">
    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
)

export const WhatsAppIcon = ({ size = 20, fill = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export const FacebookIcon = ({ size = 20, fill = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

export const InstagramIcon = ({ size = 20, fill = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

export const LinkedInIcon = ({ size = 20, fill = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
)
