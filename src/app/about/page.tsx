"use client";

const AboutPage = () => {
    return (
        <div className="about-container">
            <h1>About Us</h1>
            <p>Welcome to our website! We are dedicated to providing the best service possible.</p>
            <p>Our mission is to create a platform where users can find and book the best properties available.</p>
            <p>We hope you enjoy using our service!</p>

            <style jsx>{`
                .about-container {
                    max-width: 800px;
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
                p {
                    font-size: 16px;
                    line-height: 1.6;
                    color: #555;
                    margin-bottom: 10px;
                }
            `}</style>
        </div>
    );
};

export default AboutPage;