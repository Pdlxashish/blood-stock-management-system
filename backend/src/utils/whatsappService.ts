/**
 * WhatsApp Service
 * Sends messages via WhatsApp Web API or third-party service
 */

/**
 * Send WhatsApp message
 * For now, this creates a WhatsApp link that opens in the browser
 * In production, integrate with WhatsApp Business API or services like Twilio, MessageBird
 */
export const sendWhatsAppMessage = async (
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; message: string; whatsappLink?: string }> => {
  try {
    console.log('📱 [WHATSAPP SERVICE] Preparing to send message');
    console.log('   To:', phoneNumber);
    console.log('   Message:', message);

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Ensure phone starts with country code
    let formattedPhone = cleanPhone;
    if (!cleanPhone.startsWith('+')) {
      // Assume Nepal country code if not provided
      formattedPhone = cleanPhone.startsWith('977') ? `+${cleanPhone}` : `+977${cleanPhone}`;
    }

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp link
    const whatsappLink = `https://wa.me/${formattedPhone.replace('+', '')}?text=${encodedMessage}`;
    
    console.log('✅ [WHATSAPP SERVICE] WhatsApp link generated:', whatsappLink);
    console.log('💡 [WHATSAPP SERVICE] In production, integrate with WhatsApp Business API');
    
    // TODO: In production, integrate with:
    // - WhatsApp Business API (official)
    // - Twilio WhatsApp API
    // - MessageBird
    // - Other WhatsApp gateway services
    
    // For now, we'll log the message and return success
    // The admin can manually send via WhatsApp Web
    
    return {
      success: true,
      message: 'WhatsApp message prepared (manual sending required)',
      whatsappLink,
    };
  } catch (error: any) {
    console.error('❌ [WHATSAPP SERVICE] Error:', error.message);
    return {
      success: false,
      message: `Failed to send WhatsApp message: ${error.message}`,
    };
  }
};

/**
 * Send OTP via WhatsApp
 */
export const sendWhatsAppOTP = async (
  phoneNumber: string,
  otp: string,
  name?: string
): Promise<{ success: boolean; message: string; whatsappLink?: string }> => {
  const message = `🩸 Blood Donation System

Hello${name ? ` ${name}` : ''}!

Your verification code for claiming your account is:

*${otp}*

This code will expire in 10 minutes.

Please do not share this code with anyone.

Thank you for being a blood donor! 🙏`;

  return sendWhatsAppMessage(phoneNumber, message);
};

/**
 * Get admin WhatsApp number from database
 */
export const getAdminWhatsAppNumber = async (): Promise<string | null> => {
  try {
    const { prisma } = await import('../../lib/prisma');
    
    const about = await prisma.about.findFirst({
      select: {
        whatsappNumber: true,
        whatsappEnabled: true,
      },
    });

    if (about && about.whatsappEnabled && about.whatsappNumber) {
      return about.whatsappNumber;
    }

    // Fallback to environment variable
    return process.env.WHATSAPP_NUMBER || null;
  } catch (error) {
    console.error('Error fetching admin WhatsApp number:', error);
    return process.env.WHATSAPP_NUMBER || null;
  }
};

/**
 * Check if phone number is valid
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid length (10 digits for Nepal, or with country code)
  return cleaned.length >= 10 && cleaned.length <= 15;
};

/**
 * Check if string is an email
 */
export const isEmail = (input: string): boolean => {
  return input.includes('@') && input.includes('.');
};
