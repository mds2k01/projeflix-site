const { Devices } = require('../models/deviceModel');

const getDevicesByUser = async (owner) => {

    let allDevices = {};

    const devicesOwner = await Devices.getAllDevicesFromUser(owner);
    // console.log('devices:', devicesOwner);
    if (devicesOwner.success == true) {

        allDevices = devicesOwner.devices;

        for (i = 0; i < allDevices.length; i++) {
            let device = allDevices[i];
            const deviceContent = await Devices.getDeviceContentFromDevice(device.device_id);
            // console.log('DeviceContent:', deviceContent.content);
            const category = deviceContent.content[0].last_category;
            device.last_category = category;
            // device.last_category = deviceContent.content[0].last_category;
        }
    }

    return allDevices;
}

module.exports = { getDevicesByUser };