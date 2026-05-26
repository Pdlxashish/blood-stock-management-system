import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

// Get About content
export const getAboutContent = async (req: Request, res: Response) => {
  try {
    // Get the first (and should be only) About record
    let about = await prisma.about.findFirst();

    // If no record exists, create one with default values
    if (!about) {
      about = await prisma.about.create({
        data: {},
      });
    }

    res.json({
      success: true,
      data: about,
    });
  } catch (error: any) {
    console.error('Error fetching about content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch about content',
      error: error.message,
    });
  }
};

// Update About content (Admin only)
export const updateAboutContent = async (req: Request, res: Response) => {
  try {
    const {
      heroTitle,
      heroSubtitle,
      missionTitle,
      missionContent,
      visionTitle,
      visionContent,
      values,
      storyTitle,
      storyContent,
      stats,
      contactAddress,
      contactPhone,
      contactEmail,
      contactEmergency,
      whatWeDo,
    } = req.body;

    // Get the first About record or create if doesn't exist
    let about = await prisma.about.findFirst();

    const updateData: any = {};

    // Only update fields that are provided
    if (heroTitle !== undefined) updateData.heroTitle = heroTitle;
    if (heroSubtitle !== undefined) updateData.heroSubtitle = heroSubtitle;
    if (missionTitle !== undefined) updateData.missionTitle = missionTitle;
    if (missionContent !== undefined) updateData.missionContent = missionContent;
    if (visionTitle !== undefined) updateData.visionTitle = visionTitle;
    if (visionContent !== undefined) updateData.visionContent = visionContent;
    if (values !== undefined) {
      updateData.values = typeof values === 'string' ? values : JSON.stringify(values);
    }
    if (storyTitle !== undefined) updateData.storyTitle = storyTitle;
    if (storyContent !== undefined) updateData.storyContent = storyContent;
    if (stats !== undefined) {
      updateData.stats = typeof stats === 'string' ? stats : JSON.stringify(stats);
    }
    if (contactAddress !== undefined) updateData.contactAddress = contactAddress;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactEmergency !== undefined) updateData.contactEmergency = contactEmergency;
    if (whatWeDo !== undefined) {
      updateData.whatWeDo = typeof whatWeDo === 'string' ? whatWeDo : JSON.stringify(whatWeDo);
    }

    if (about) {
      // Update existing record
      about = await prisma.about.update({
        where: { id: about.id },
        data: updateData,
      });
    } else {
      // Create new record
      about = await prisma.about.create({
        data: updateData,
      });
    }

    res.json({
      success: true,
      message: 'About content updated successfully',
      data: about,
    });
  } catch (error: any) {
    console.error('Error updating about content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update about content',
      error: error.message,
    });
  }
};
