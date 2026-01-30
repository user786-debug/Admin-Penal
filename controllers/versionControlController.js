
const VersionControl  = require('../models/versionControl');  

const addVersion = async (req, res) => {
  try {
    const { deviceType, version, status, releaseDate, description } = req.body;

    if (!deviceType || !version || !status || !releaseDate || !description) {
      return res.status(400).json({
        success: false,
        message: 'deviceType, version, status, releaseDate and description are required.',
      });
    }

    if (!['ios', 'android'].includes(deviceType)) {
      return res.status(400).json({ success: false, message: 'Invalid deviceType. Must be "ios" or "android".' });
    }

    const newVersion = await VersionControl.create({
      deviceType,
      version,
      status,
      releaseDate,
      description,
    });

    res.status(201).json({ success: true, message: 'Version added successfully', data: newVersion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to add version', error: error.message });
  }
};

const getIosVersions = async (req, res) => {
  try {
    const iosVersions = await VersionControl.findAll({ where: { deviceType: 'ios' } });

    if (iosVersions.length === 0) {
      return res.status(404).json({ success: false, message: 'No iOS versions found' });
    }

    res.status(200).json({ success: true, message: 'iOS versions fetched successfully', data: iosVersions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch iOS versions', error: error.message });
  }
};

const getAndroidVersions = async (req, res) => {
  try {
    const androidVersions = await VersionControl.findAll({ where: { deviceType: 'android' } });

    if (androidVersions.length === 0) {
      return res.status(404).json({ success: false, message: 'No Android versions found' });
    }

    res.status(200).json({ success: true, message: 'Android versions fetched successfully', data: androidVersions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch Android versions', error: error.message });
  }
};

const updateVersionStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!['beta', 'latest', 'stable', 'outdated'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be one of: "beta", "latest", "stable", "outdated".' });
    }

    const version = await VersionControl.findByPk(id);
    if (!version) {
      return res.status(404).json({ success: false, message: 'Version not found' });
    }

    version.status = status;
    await version.save();

    res.status(200).json({ success: true, message: 'Version status updated successfully', data: version });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update version status', error: error.message });
  }
};


module.exports = {
  addVersion,
  getIosVersions,
  getAndroidVersions,
  updateVersionStatus
};
