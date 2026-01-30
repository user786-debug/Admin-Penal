const { Op } = require('sequelize');
const SupportManager = require('../models/supportManagers'); 
const multer = require('multer'); 
const path = require('path');
const bcrypt = require('bcrypt'); 
const formatCount = require('../middlewares/formatCount'); 
const { encrypt, decrypt } = require('../middlewares/encryption');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '..', 'uploads','supportManagers'); 
      cb(null, uploadPath); 
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName); // File name
    },
  });
  
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); 
    } else {
      cb(null, false); 
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
    const fileUrl = `${protocol}://${host}/uploads/supportManagers/${req.file.filename}`;
  
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
  
exports.createSupportManager = async (req, res) => {
    const { name, userId, email, password, imageUrl } = req.body;

    if (!name || !userId || !email || !password || !imageUrl) {
        return res.status(400).json({
            success: false,
            message: 'Name, userId, email, image and password are required.',
        });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).+$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            message: 'Password must contain at least one uppercase letter, one lowercase letter, and one special character.',
        });
    }

    try {
        const existingUser = await SupportManager.findOne({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already in use.',
            });
        }

        const existingUserId = await SupportManager.findOne({
            where: { userId },
        });

        if (existingUserId) {
            return res.status(400).json({
                success: false,
                message: 'UserId already in use.',
            });
        }

        const encryptedPassword = encrypt(password);

        const newSupportManager = await SupportManager.create({
            name,
            userId,
            email,
            password: encryptedPassword, 
            imageUrl
        });

        res.status(201).json({
            success: true,
            message: 'Support Manager account created successfully.',
            data: {
                id: newSupportManager.id,
                name: newSupportManager.name,
                userId: newSupportManager.userId,
                email: newSupportManager.email,
                imageUrl: newSupportManager.imageUrl,
            },
        });
    } catch (error) {
        console.error('[ERROR] Creating Support Manager:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

exports.getSupportManagers = async (req, res) => {
    const { page = 1 } = req.query;  
    const limit = 20;  
    const offset = (page - 1) * limit;  

    try {
        const supportManagers = await SupportManager.findAndCountAll({
            attributes: ['id','imageUrl', 'name', 'userId', 'email', 'password', ], 
            limit,
            offset,
        });

        const supportManagersWithProcessedPasswords = supportManagers.rows.map((manager) => {
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
                imageUrl: manager.imageUrl, 
                name: manager.name,
                userId: manager.userId,
                email: manager.email,
                password: actualPassword,
            };
        });

        const totalPages = Math.ceil(supportManagers.count / limit);  

        return res.json({
            success: true,
            message: 'Support Managers retrieved successfully',
            data: supportManagersWithProcessedPasswords,
            pagination: {
                currentPage: parseInt(page),
                totalPages: totalPages,
                totalRecords: supportManagers.count,
                recordsPerPage: limit,
            },
        });
    } catch (error) {
        console.error('[ERROR] Fetching Support Managers Failed:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch support managers',
        });
    }
};

exports.updateSupportManager = async (req, res) => {
  const { id, email, name, userId, imageUrl, password } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'ID is required.',
    });
  }

  try {
    const supportManager = await SupportManager.findByPk(id);

    if (!supportManager) {
      return res.status(404).json({
        success: false,
        message: 'Support Manager not found.',
      });
    }

    if (email) {
      const existingManagerWithEmail = await SupportManager.findOne({
        where: { email, id: { [Op.not]: id } }, 
        paranoid: false, 
      });

      if (existingManagerWithEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists for another support manager.',
        });
      }
    }

    if (userId) {
      const existingManagerWithUserId = await SupportManager.findOne({
        where: { userId, id: { [Op.not]: id } }, 
        paranoid: false, 
      });

      if (existingManagerWithUserId) {
        return res.status(400).json({
          success: false,
          message: 'User ID already exists for another support manager.',
        });
      }
    }

    supportManager.imageUrl = imageUrl || supportManager.imageUrl;
    supportManager.email = email || supportManager.email;
    supportManager.name = name || supportManager.name;
    supportManager.userId = userId || supportManager.userId;

    if (password) {
      supportManager.password = encrypt(password); // Assuming `encrypt` is a function to hash the password
    }

    await supportManager.save();

    // Prepare response
    const responseData = {
      id: supportManager.id,
      imageUrl: supportManager.imageUrl,
      name: supportManager.name,
      email: supportManager.email,
      userId: supportManager.userId,
      createdAt: supportManager.createdAt,
      updatedAt: supportManager.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: 'Support Manager updated successfully!',
      data: responseData,
    });
  } catch (error) {
    console.error('Error updating support manager:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the support manager.',
      error: error.message,
    });
  }
};

exports.deleteSupportManager = async (req, res) => {
    const { id } = req.params; 

    try {
        const supportManager = await SupportManager.findByPk(id);

        if (!supportManager) {
            return res.status(404).json({
                success: false,
                message: 'Support Manager not found.',
            });
        }

        await supportManager.destroy(); 

        return res.status(200).json({
            success: true,
            message: 'Support Manager deleted successfully!',
        });
    } catch (error) {
        console.error('Error deleting support manager:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while deleting the support manager.',
            error: error.message,
        });
    }
};

exports.supportManagerCount = async (req, res) => {
    try {
        const supportManagerCount = await SupportManager.count();
        const formattedCount = formatCount(supportManagerCount);

        res.status(200).json({
            success: true,
            message: 'Total support manager count retrieved successfully',
            data: {
                totalSupportManagers: formattedCount, 
            },
        });
    } catch (error) {
        console.error('[ERROR] Fetching Support Manager Count Failed:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch support manager count. Please try again later.',
            error: error.message,
        });
    }
};

// exports.createSupportManager = async (req, res) => {
  //     const { name, userId, email, password, imageUrl } = req.body; // Receiving the image path
  //     // Validate required fields
  //     if (!name || !userId || !email || !password || !imageUrl) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Name, userId, email,image and password are required.',
  //       });
  //     }
    
  //     try {
  //       // Check if email or userId already exists
  //       const existingUser = await SupportManager.findOne({
  //         where: { email },
  //       });
    
  //       if (existingUser) {
  //         return res.status(400).json({
  //           success: false,
  //           message: 'Email already in use.',
  //         });
  //       }
    
  //       const existingUserId = await SupportManager.findOne({
  //         where: { userId },
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
  //       const newSupportManager = await SupportManager.create({
  //         name,
  //         userId,
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
  //           userId: newSupportManager.userId,
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
  
  // exports.getSupportManagers = async (req, res) => {
  //     const { page = 1 } = req.query;  // Get page number from query (default to 1 if not provided)
  //     const limit = 20;  // Limit per page
  //     const offset = (page - 1) * limit;  // Calculate the offset
  
  //     try {
  //         // Fetch the total count of support managers
  //         const totalRecords = await SupportManager.count();
  
  //         // Calculate total pages
  //         const totalPages = Math.ceil(totalRecords / limit);
  
  //         // Fetch the managers from the database with pagination
  //         const supportManagers = await SupportManager.findAll({
  //             attributes: ['id','imageUrl', 'name', 'userId', 'email', 'password'],  // Selecting the required fields
  //             limit: limit,  // Pagination limit
  //             offset: offset,  // Pagination offset
  //         });
  
  //         // Return the result with pagination details
  //         return res.json({
  //             success: true,
  //             data: supportManagers,
  //             page: parseInt(page),
  //             limit: limit,
  //             totalRecords: totalRecords,
  //             totalPages: totalPages,
  //         });
  //     } catch (error) {
  //         console.error('[ERROR] Fetching Support Managers Failed:', error.message);
  //         return res.status(500).json({
  //             success: false,
  //             message: 'Failed to fetch support managers',
  //         });
  //     }
  // };
  
  // exports.updateSupportManager = async (req, res) => {
  //     const { id, email, name, userId, imageUrl } = req.body; // Exclude fields like status, password, otp, and otpExpiry
  
  //     // Validate required fields
  //     if (!id) {
  //         return res.status(400).json({
  //             success: false,
  //             message: 'ID is required.',
  //         });
  //     }
  
  //     try {
  //         // Find the support manager by ID
  //         const supportManager = await SupportManager.findByPk(id); // Using `findByPk` to find by primary key
  
  //         if (!supportManager) {
  //             return res.status(404).json({
  //                 success: false,
  //                 message: 'Support Manager not found.',
  //             });
  //         }
  
  //         // Update fields only if they are provided in the request
  //         supportManager.imageUrl = imageUrl || supportManager.imageUrl; // Keep existing value if not provided
  //         supportManager.email = email || supportManager.email; // Keep existing value if not provided
  //         supportManager.name = name || supportManager.name;
  //         supportManager.userId = userId || supportManager.userId;
  
  //         await supportManager.save(); // Save the updated support manager
  
  //         // Exclude sensitive fields from the response
  //         const responseData = {
  //             id: supportManager.id,
  //             imageUrl: supportManager.imageUrl,
  //             name: supportManager.name,
  //             email: supportManager.email,
  //             userId: supportManager.userId,
  //             createdAt: supportManager.createdAt,
  //             updatedAt: supportManager.updatedAt,
  //         };
  
  //         return res.status(200).json({
  //             success: true,
  //             message: 'Support Manager updated successfully!',
  //             data: responseData, // Send filtered response
  //         });
  //     } catch (error) {
  //         console.error('Error updating support manager:', error);
  //         return res.status(500).json({
  //             success: false,
  //             message: 'An error occurred while updating the support manager.',
  //             error: error.message,
  //         });
  //     }
  // };
  
