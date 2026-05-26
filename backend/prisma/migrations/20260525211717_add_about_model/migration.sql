-- CreateTable
CREATE TABLE "About" (
    "id" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL DEFAULT 'About VitalFlow',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'We''re on a mission to make blood donation accessible, efficient, and impactful for everyone.',
    "missionTitle" TEXT NOT NULL DEFAULT 'Our Mission',
    "missionContent" TEXT NOT NULL DEFAULT 'To create a seamless bridge between blood donors and those in need, ensuring that no life is lost due to blood shortage.',
    "visionTitle" TEXT NOT NULL DEFAULT 'Our Vision',
    "visionContent" TEXT NOT NULL DEFAULT 'A world where every person has access to safe blood when they need it.',
    "values" TEXT NOT NULL DEFAULT '[{"title":"Community First","description":"We believe in the power of community and collective action to save lives.","icon":"Users"},{"title":"Excellence","description":"We maintain the highest standards in blood collection, storage, and distribution.","icon":"Award"},{"title":"Compassion","description":"Every interaction is guided by empathy and understanding of the critical nature of our work.","icon":"Heart"}]',
    "storyTitle" TEXT NOT NULL DEFAULT 'Our Story',
    "storyContent" TEXT NOT NULL DEFAULT 'VitalFlow was founded with a simple yet powerful idea: use technology to save lives through better blood donation management.',
    "stats" TEXT NOT NULL DEFAULT '[{"label":"Active Donors","value":"500+"},{"label":"Lives Saved","value":"1,200+"},{"label":"Partner Hospitals","value":"25+"},{"label":"Blood Units Collected","value":"3,000+"}]',
    "contactAddress" TEXT NOT NULL DEFAULT '123 Blood Bank Street, Medical District, City 12345',
    "contactPhone" TEXT NOT NULL DEFAULT '+1 (555) 123-4567',
    "contactEmail" TEXT NOT NULL DEFAULT 'info@bloodbank.org',
    "contactEmergency" TEXT NOT NULL DEFAULT '+1 (555) 999-BLOOD',
    "whatWeDo" TEXT NOT NULL DEFAULT '[{"title":"Blood Collection","description":"We organize regular blood donation camps and operate mobile collection units."},{"title":"Testing & Processing","description":"Every unit of blood is thoroughly tested and processed following international standards."},{"title":"Storage & Distribution","description":"We maintain state-of-the-art storage facilities and efficient distribution systems."},{"title":"Community Engagement","description":"We conduct awareness programs, donor recruitment drives, and educational initiatives."}]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "About_pkey" PRIMARY KEY ("id")
);
