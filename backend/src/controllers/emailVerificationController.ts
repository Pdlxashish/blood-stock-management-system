import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

/**
 * Check if email exists and return associated accounts
 * GET /api/email/check?email=user@example.com
 */
export const checkEmailExists = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required',
      });
    }

    console.log('🔍 Checking email:', email);

    // Find all users with this email
    const users = await prisma.user.findMany({
      where: {
        email: email.toLowerCase().trim(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        donor: {
          select: {
            bloodGroup: true,
            location: true,
          },
        },
      },
    });

    console.log('📊 Found users:', users.length);

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No account found with this email',
        exists: false,
        accounts: [],
      });
    }

    // Format the response
    const accounts = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      bloodGroup: user.donor?.bloodGroup || null,
      location: user.donor?.location || null,
      createdAt: user.createdAt,
    }));

    console.log('✅ Returning accounts:', accounts);

    return res.status(200).json({
      status: 'success',
      message: `Found ${accounts.length} account(s) with this email`,
      exists: true,
      accounts,
    });
  } catch (error) {
    console.error('❌ Error checking email:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to check email',
    });
  }
};
