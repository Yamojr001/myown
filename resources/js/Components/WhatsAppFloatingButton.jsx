export default function WhatsAppFloatingButton() {
    return (
        <a 
            href="https://wa.me/2349018710083" 
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-[70] bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-3xl shadow-green-500/20"
            title="Contact Support"
        >
            <i className="fab fa-whatsapp"></i>
        </a>
    );
}
