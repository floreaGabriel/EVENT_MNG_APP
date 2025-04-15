import transporter from './nodemailer.js';

export const sendVerificationEmail = async (user) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${user.verificationToken}`;

    const mailOptions = {
        from: `"Aplicația de evenimente" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Verifică adresa de email',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #333;">Salut, ${user.firstname}!</h2>
                <p>Îți mulțumim pentru înregistrare. Te rugăm să verifici adresa de email făcând clic pe butonul de mai jos.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                        Verifică adresa de email
                    </a>
                </div>
                
                <p>Sau poți copia și lipi următorul link în browser:</p>
                <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
                
                <p>Acest link expiră în 24 de ore.</p>
                
                <p style="margin-top: 30px; font-size: 12px; color: #888;">
                    Dacă nu ai solicitat acest email, te rugăm să îl ignori.
                </p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
};


export const sendPasswordResetEmail = async (user) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${user.resetPasswordToken}`;

    const mailOptions = {
        from: `"Aplicația de evenimente" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Resetare parolă',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #333;">Salut, ${user.firstname}!</h2>
                <p>Am primit o solicitare de resetare a parolei pentru contul tău. Dacă nu ai solicitat acest lucru, te rugăm să ignori acest email.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                        Resetează parola
                    </a>
                </div>
                
                <p>Sau poți copia și lipi următorul link în browser:</p>
                <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                
                <p>Acest link expiră în 1 oră.</p>
                
                <p style="margin-top: 30px; font-size: 12px; color: #888;">
                    Dacă nu ai solicitat resetarea parolei, te rugăm să ne contactezi imediat.
                </p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
};


export const sendTemporaryPasswordEmail = async (user, temporaryPassword) => {
    const mailOptions = {
        from: `"Aplicația de evenimente" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Parola ta temporară',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #333;">Salut, ${user.firstname}!</h2>
                <p>Am generat o parolă temporară pentru contul tău. Te rugăm să o folosești pentru a te autentifica și apoi să o schimbi imediat.</p>
                
                <div style="text-align: center; margin: 30px 0; padding: 15px; background-color: #f5f5f5; border-radius: 4px;">
                    <p style="font-size: 20px; font-weight: bold; letter-spacing: 2px;">${temporaryPassword}</p>
                </div>
                
                <p>Din motive de securitate, te rugăm să schimbi această parolă imediat după autentificare.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/login" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                        Autentifică-te acum
                    </a>
                </div>
                
                <p style="margin-top: 30px; font-size: 12px; color: #888;">
                    Dacă nu ai solicitat acest lucru, te rugăm să ne contactezi imediat.
                </p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
}; 