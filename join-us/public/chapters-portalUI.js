import React, { useState } from 'react';

export default function ChapterPortal() {
    // Using local state to simulate navigation
    const [currentPage, setCurrentPage] = useState('main');
    const [showContactForm, setShowContactForm] = useState(false);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        university: '',
        message: ''
    });

    const handleContactFormChange = (e) => {
        const { name, value } = e.target;
        setContactForm(prev => ({...prev, [name]: value }));
    };

    const submitContactForm = () => {
        console.log('Contact form submitted:', contactForm);
        // In a real app, you would call your API here
        setShowContactForm(false);
        setContactForm({
            name: '',
            email: '',
            university: '',
            message: ''
        });
        alert('Thank you for contacting the Chapter Coordinator. We will respond shortly.');
    };

    return ( <
        div className = "flex flex-col min-h-screen" > { /* Top Navigation */ } <
        header className = "bg-blue-800 p-4 text-white flex justify-end" >
        <
        button onClick = {
            () => setCurrentPage('summit-highlights')
        }
        className = "bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-all duration-200" >
        View Previous Summit Highlights < /button> </header >

        { /* Main Content */ } <
        main className = "flex-grow" >
        <
        div className = "max-w-6xl mx-auto py-12 px-4" > { /* Title Section */ } <
        div className = "text-center mb-12" >
        <
        h1 className = "text-3xl font-bold mb-2" > How to Join or Start a Chapter < /h1> <
        p className = "text-gray-600" > YSN welcomes youth from other institutions to apply to start a new chapter < /p> < /
        div >

        { /* Two Column Layout */ } <
        div className = "grid md:grid-cols-2 gap-8 mb-16" > { /* Left Column - Requirements */ } <
        div className = "bg-white p-6 rounded-lg shadow-md" >
        <
        h2 className = "text-xl font-semibold border-b border-gray-300 pb-2 mb-4" > Requirements to Qualify < /h2> <
        ul className = "space-y-4" >
        <
        li className = "flex items-start" >
        <
        span className = "text-green-500 mr-2" > ✓ < /span> <
        span > The university must offer a law degree < /span> < /
        li > <
        li className = "flex items-start" >
        <
        span className = "text-green-500 mr-2" > ✓ < /span> <
        span > At least 15 founding members needed < /span> < /
        li > <
        li className = "flex items-start" >
        <
        span className = "text-green-500 mr-2" > ✓ < /span> <
        span > Must commit to a one - year activity calendar < /span> < /
        li > <
        li className = "flex items-start" >
        <
        span className = "text-green-500 mr-2" > ✓ < /span> <
        span > Formal application submitted to the National Secretariat < /span> < /
        li > <
        /ul> <
        div className = "mt-6" >
        <
        button onClick = {
            () => {
                console.log('Download application form');
                alert('Application form downloaded successfully!');
            }
        }
        className = "bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-all duration-200" >
        Download Application Form <
        /button> < /
        div > <
        /div>

        { /* Right Column - Benefits */ } <
        div className = "bg-white p-6 rounded-lg shadow-md" >
        <
        h2 className = "text-xl font-semibold border-b border-gray-300 pb-2 mb-4" > Benefits After Approval < /h2> <
        ul className = "space-y-4" >
        <
        li className = "flex items-start" >
        <
        span className = "text-orange-500 mr-2" > ■ < /span> <
        span > Branding materials(banners, shirts, brochures) < /span> < /
        li > <
        li className = "flex items-start" >
        <
        span className = "text-orange-500 mr-2" > ■ < /span> <
        span > Access to national forums and grants < /span> < /
        li > <
        li className = "flex items-start" >
        <
        span className = "text-orange-500 mr-2" > ■ < /span> <
        span > Training and mentorship from existing leaders < /span> < /
        li > <
        li className = "flex items-start" >
        <
        span className = "text-orange-500 mr-2" > ■ < /span> <
        span > Support
        for campus events and outreach < /span> < /
        li > <
        li className = "flex items-start" >
        <
        span className = "text-orange-500 mr-2" > ■ < /span> <
        span > Networking opportunities with legal professionals < /span> < /
        li > <
        /ul> <
        div className = "mt-6" >
        <
        button onClick = {
            () => setShowContactForm(true)
        }
        className = "bg-white border border-orange-500 text-orange-500 hover:bg-orange-50 px-4 py-2 rounded transition-all duration-200" >
        Contact Chapter Coordinator <
        /button> < /
        div > <
        /div> < /
        div > <
        /div>

        { /* Bottom CTA Section */ } <
        div className = "bg-blue-800 py-16 text-white text-center" >
        <
        div className = "max-w-4xl mx-auto px-4" >
        <
        h2 className = "text-3xl font-bold mb-4" > Ready to Make an Impact ? < /h2> <
        p className = "mb-8" > Join a vibrant community of youth leaders who are changing Kenya through legal empowerment and community service. < /p> <
        div className = "flex flex-col sm:flex-row justify-center gap-4" >
        <
        button onClick = {
            () => navigate('/start-chapter')
        }
        className = "bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded font-medium transition-all duration-200" >
        Start a Chapter <
        /button> <
        button onClick = {
            () => navigate('/join-chapter')
        }
        className = "bg-blue-700 hover:bg-blue-800 border border-white text-white px-6 py-3 rounded font-medium transition-all duration-200" >
        Join Existing Chapter <
        /button> < /
        div > <
        /div> < /
        div > <
        /main>

        { /* Contact Form Modal */ } {
            showContactForm && ( <
                div className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" >
                <
                div className = "bg-white rounded-lg shadow-lg p-6 w-full max-w-md" >
                <
                h3 className = "text-xl font-bold mb-4" > Contact Chapter Coordinator < /h3> <
                div className = "space-y-4" >
                <
                div >
                <
                label className = "block text-gray-700 mb-1" > Name < /label> <
                input type = "text"
                name = "name"
                value = { contactForm.name }
                onChange = { handleContactFormChange }
                className = "w-full p-2 border rounded"
                required /
                >
                <
                /div> <
                div >
                <
                label className = "block text-gray-700 mb-1" > Email < /label> <
                input type = "email"
                name = "email"
                value = { contactForm.email }
                onChange = { handleContactFormChange }
                className = "w-full p-2 border rounded"
                required /
                >
                <
                /div> <
                div >
                <
                label className = "block text-gray-700 mb-1" > University(Optional) < /label> <
                input type = "text"
                name = "university"
                value = { contactForm.university }
                onChange = { handleContactFormChange }
                className = "w-full p-2 border rounded" /
                >
                <
                /div> <
                div >
                <
                label className = "block text-gray-700 mb-1" > Message < /label> <
                textarea name = "message"
                value = { contactForm.message }
                onChange = { handleContactFormChange }
                className = "w-full p-2 border rounded"
                rows = "4"
                required >
                <
                /textarea> < /
                div > <
                div className = "flex justify-end gap-2 pt-2" >
                <
                button type = "button"
                onClick = {
                    () => setShowContactForm(false)
                }
                className = "px-4 py-2 border rounded text-gray-700 hover:bg-gray-100" >
                Cancel <
                /button> <
                button type = "button"
                onClick = { submitContactForm }
                className = "px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600" >
                Send Message <
                /button> < /
                div > <
                /div> < /
                div > <
                /div>
            )
        } <
        /div>
    );
}