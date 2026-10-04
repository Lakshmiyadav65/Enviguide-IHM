import { Link } from 'react-router-dom'

// In-app routes go through the router; "#" placeholders (pages that don't exist yet) stay plain anchors.
export default function SiteLink({ to, ...props }) {
  if (to === '#') return <a href="#" {...props} />
  return <Link to={to} {...props} />
}
