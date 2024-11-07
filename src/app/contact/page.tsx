"use client";
import { useState } from 'react';

const ContactPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', { name, email, message });
    };

    return (
        <div className="contact-container">
            <h1>Contact Us</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Message:</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Submit</button>
            </form>

            <style jsx>{`
                .contact-container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    text-align: center;
                    margin-bottom: 20px;
                    color: #333;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    color: #333;
                }
                .form-group input,
                .form-group textarea {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                }
                button {
                    display: block;
                    width: 100%;
                    padding: 10px;
                    background-color: #0070f3;
                    color: #fff;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                }
                button:hover {
                    background-color: #005bb5;
                }
            `}</style>
        </div>
    );
};

export default ContactPage;