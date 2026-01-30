const { Op } = require('sequelize');
const Manager = require('../models/starsManagers'); 
const multer = require('multer'); 
const path = require('path');
const bcrypt = require('bcrypt'); 
const formatCount = require('../middlewares/formatCount'); 
const { encrypt, decrypt } = require('../middlewares/encryption');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '..', 'uploads','starManagers'); // Upload path
      cb(null, uploadPath); // Destination folder
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName); // File name
    },
  });
  
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept image files
    } else {
      cb(null, false); // Reject non-image files
    }
  };
  
exports.upload = multer({ storage, fileFilter });
  
exports.uploadImage = async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided or invalid file type.',
      });
    }
  
    const protocol = req.protocol; 
    const host = req.get('host');   
    const fileUrl = `${protocol}://${host}/uploads/starManagers/${req.file.filename}`;
  
    try {
      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully.',
        data: {
          url: fileUrl, 
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to save image URL to the database.',
        error: error.message,
      });
    }
};
  

exports.createStarManager = async (req, res) => {
    const { name, uId, email, password, imageUrl } = req.body;

    if (!name || !uId || !email || !password || !imageUrl) {
        return res.status(400).json({
            success: false,
            message: 'name, uId, email, password, and imageUrl are required.',
        });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).+$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            message: 'Password must contain at least one uppercase letter, one lowercase letter, and one special character.',
        });
    }

    const existingUserId = await Manager.findOne({ where: { uId } });
        if (existingUserId) {
            return res.status(400).json({ success: false, message: 'UserId already in use.' });
        }

    try {
        const existingUser = await Manager.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already in use.' });
        }

        

        const encryptedPassword = encrypt(password);

        const newManager = await Manager.create({
            name,
            uId,
            email,
            password: encryptedPassword,
            imageUrl,
        });

        res.status(201).json({
            success: true,
            message: 'Star Manager account created successfully.',
            data: {
                id: newManager.id,
                name: newManager.name,
                userId: newManager.uId,
                email: newManager.email,
                imageUrl: newManager.imageUrl,
            },
        });
    } catch (error) {
        console.error('[ERROR] Creating Star Manager:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

exports.getstarManagers = async (req, res) => {
    const { page = 1 } = req.query; 
    const limit = 20; 
    const offset = (page - 1) * limit; 

    try {
        const managers = await Manager.findAndCountAll({
            attributes: ['id', 'imageUrl','name', 'uId', 'email', 'password'], 
            limit,
            offset,
        });

        const managersWithProcessedPasswords = managers.rows.map((manager) => {
            let actualPassword = null;

            if (manager.password) {
                if (manager.password.includes(':')) {
                    try {
                        actualPassword = decrypt(manager.password);
                    } catch (error) {
                        console.error(`[ERROR] Decrypting Password for Manager ID ${manager.id}:`, error.message);
                    }
                } else if (manager.password.startsWith('$2b$')) {
                    actualPassword = '[Password is hashed]'; 
                }
            }

            return {
                id: manager.id,
                image: manager.imageUrl,
                name: manager.name,
                userId: manager.uId,
                email: manager.email,
                password: actualPassword, 
            };
        });

        const totalPages = Math.ceil(managers.count / limit); 

        return res.json({
            success: true,
          message: "Star Managers are retrieved successfully",

            data: managersWithProcessedPasswords, 
            pagination: {
                currentPage: parseInt(page),
                totalPages: totalPages,
                totalRecords: managers.count,
                recordsPerPage: limit,
            },
        });
    } catch (error) {
        console.error('[ERROR] Fetching Managers Failed:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch managers',
        });
    }
};

exports.updateManager = async (req, res) => {
    const { id,name, email, password, uId, imageUrl } = req.body;
  
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required.',
      });
    }
  
    try {
      const manager = await Manager.findByPk(id);
  
      if (!manager) {
        return res.status(404).json({
          success: false,
          message: 'Manager not found.',
        });
      }
  
      if (email) {
        const existingManagerWithEmail = await Manager.findOne({
          where: { email, id: { [Op.not]: id } }, 
        });
  
        if (existingManagerWithEmail) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists for another manager.',
          });
        }
      }
  
      if (uId) {
        const existingManagerWithUId = await Manager.findOne({
          where: { uId, id: { [Op.not]: id } }, 
        });
  
        if (existingManagerWithUId) {
          return res.status(400).json({
            success: false,
            message: 'userId already exists for another manager.',
          });
        }
      }
  
      manager.name = name || manager.name;
      manager.imageUrl = imageUrl || manager.imageUrl;
      manager.email = email || manager.email;
      manager.userId = uId || manager.uId;
  
      if (password) {
        manager.password = encrypt(password); // Assuming `encrypt` is a function to hash the password
      }
  
      await manager.save();
  
      // Prepare response
      const managerResponse = manager.toJSON();
      managerResponse.password = password ? password : decrypt(manager.password);
      
      delete managerResponse.otp;
      delete managerResponse.otpExpiry;
  
      return res.status(200).json({
        success: true,
        message: 'Manager updated successfully!',
        data: managerResponse,
      });
    } catch (error) {
      console.error('[ERROR] Updating Manager:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
      });
    }
};


exports.deleteManager = async (req, res) => {
    const { id } = req.params;  

    try {
        const manager = await Manager.findOne({ where: { id } });

        if (!manager) {
            return res.status(404).json({
                success: false,
                message: 'Star Manager not found.',
            });
        }

        await manager.destroy();

        res.status(200).json({
            success: true,
            message: 'Manager deleted successfully.',
        });
    } catch (error) {
        console.error('[ERROR] Deleting Manager Failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};


exports.starManagerCount = async (req, res) => {
    try {
        const managerCount = await Manager.count();
        const formattedCount = formatCount(managerCount); 

        res.status(200).json({
            success: true,
            message: 'Total manager count retrieved successfully',
            data: {
                totalManagers: formattedCount, 
            },
        });
    } catch (error) {
        console.error('[ERROR] Fetching Manager Count Failed:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch manager count. Please try again later.',
            error: error.message,
        });
    }
};




  // Create Support Manager
// exports.createStarManager = async (req, res) => {
//     const { name, uId, email, password, imageUrl } = req.body; // Receiving the image path
//     // Validate required fields
//     if (!name || !uId || !email || !password || !imageUrl) {
//       return res.status(400).json({
//         success: false,
//         message: 'Name, uId, email,image and password are required.',
//       });
//     }
  
//     try {
//       // Check if email or userId already exists
//       const existingUser = await Manager.findOne({
//         where: { email },
//       });
  
//       if (existingUser) {
//         return res.status(400).json({
//           success: false,
//           message: 'Email already in use.',
//         });
//       }
  
//       const existingUserId = await Manager.findOne({
//         where: { uId },
//       });
  
//       if (existingUserId) {
//         return res.status(400).json({
//           success: false,
//           message: 'UserId already in use.',
//         });
//       }
  
//       // Hash the password
//       const hashedPassword = await bcrypt.hash(password, 10);
  
//       // Construct image URL from the provided imagePath
//     //   let imageUrl = null;
//     //   if (imagePath) {
//     //     const protocol = req.protocol;
//     //     const host = req.get('host');
//     //     imageUrl = `${protocol}://${host}/uploads/supportManagers/${imagePath}`;
//     //   }
  
//       // Create the support manager
//       const newSupportManager = await Manager.create({
//         name,
//         uId,
//         email,
//         password: hashedPassword,
//         imageUrl // If no imagePath, keep as null
//       });
  
//       res.status(201).json({
//         success: true,
//         message: 'Support Manager account created successfully.',
//         data: {
//           id: newSupportManager.id,
//           name: newSupportManager.name,
//           userId: newSupportManager.uId,
//           email: newSupportManager.email,
//           imageUrl: newSupportManager.imageUrl,
//         },
//       });
//     } catch (error) {
//       console.error('[ERROR] Creating Support Manager:', error.message);
//       res.status(500).json({
//         success: false,
//         message: 'Internal server error.',
//       });
//     }
// };


// exports.getstarManagers = async (req, res) => {
//     const { page = 1 } = req.query;  // Get page number from query (default to 1 if not provided)
//     const limit = 20;  // Limit per page
//     const offset = (page - 1) * limit;  // Calculate the offset

//     try {
//         // Fetch the managers from the database with pagination
//         const managers = await Manager.findAndCountAll({
//             attributes: ['id', 'name','uId', 'email', 'password',],  // Selecting required fields
//             limit: limit,  // Pagination limit
//             offset: offset,  // Pagination offset
//         });

//         const totalPages = Math.ceil(managers.count / limit); // Calculate total pages

//         return res.json({
//             success: true,
//             data: managers.rows,  // Data for the current page
//             pagination: {
//                 currentPage: parseInt(page),
//                 totalPages: totalPages,
//                 totalRecords: managers.count,
//                 recordsPerPage: limit
//             }
//         });
//     } catch (error) {
//         console.error('[ERROR] Fetching Managers Failed:', error.message);
//         return res.status(500).json({
//             success: false,
//             message: 'Failed to fetch managers',
//         });
//     }
// };


// exports.updateManager = async (req, res) => {
//     const { id, email, password, uId, imageUrl } = req.body; // Destructure the fields from body
    
//     // Validate required fields
//     if (!id) {
//         return res.status(400).json({
//             success: false,
//             message: 'ID is required.',
//         });
//     }

//     try {
//         // Find the manager by ID
//         const manager = await Manager.findByPk(id); // Using `findByPk` to find by primary key

//         if (!manager) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Manager not found.',
//             });
//         }

//         // Update fields only if they are provided in the request
//         manager.imageUrl = imageUrl || manager.imageUrl;  // Keep existing value if not provided
//         manager.email = email || manager.email;  // Keep existing value if not provided
//         manager.password = password || manager.password; // Keep existing password if not provided
//         manager.uId = uId || manager.uId;  // Update uId only if provided

//         await manager.save(); // Save the updated manager

//         // Exclude fields like password, otp, otpExpiry, status from the response
//         const managerResponse = manager.toJSON(); // Convert manager instance to plain object
//         delete managerResponse.password;
//         delete managerResponse.otp;
//         delete managerResponse.otpExpiry;
//         delete managerResponse.status;

//         return res.status(200).json({
//             success: true,
//             message: 'Manager updated successfully!',
//             data: managerResponse,  // Return the updated manager without excluded fields
//         });
//     } catch (error) {
//         console.error('Error updating manager:', error);
//         return res.status(500).json({
//             success: false,
//             message: 'An error occurred while updating the manager.',
//             error: error.message,
//         });
//     }
// };
