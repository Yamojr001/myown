export default function ApplicationLogo(props) {
    return (
        <div {...props} className={`flex items-center gap-2 font-black ${props.className || ''}`}>
            <i className="fas fa-brain text-brand-blue"></i>
            <span className="text-brand-dark tracking-tight">Phronix AI</span>
        </div>
    );
}
