import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});


const deleteImageFromCloudinary = async (publicId, resourceType) => {
    try {
        const result = await cloudinary.api.delete_resources([`Agrisistance/${resourceType}/${publicId}`], { type: 'upload', resource_type: 'image' });
        console.log(`Deleted ${resourceType} with public_id ${publicId}`);
    } catch (error) {
        console.error(`Error deleting ${resourceType} with public_id ${publicId}:`, error.message );
    }
};

// Function to extract public_id from Cloudinary URL
const extractPublicId = (imageUrl) => {
    try {
        // Split the URL by '/' and get the last part
        const parts = imageUrl.split('/');
        let lastPart = parts.pop();

        // Remove the file extension (e.g., '.jpg', '.png') if present
        const publicId = lastPart.split('.')[0];

        return publicId;
    } catch (error) {
        console.error('Error extracting public_id:', error);
        return null; // Handle error gracefully if needed
    }
};


export {extractPublicId , deleteImageFromCloudinary}