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
            const last_category = deviceContent.content[0].last_category;
            device.last_category = last_category;
            const title = deviceContent.content[0].title;
            device.title = title;
            const category = deviceContent.content[0].category;
            device.category = category;
            const last_access = device.updated_at;
            device.last_access = last_access;
        }
    }

    return allDevices;
}

module.exports = { getDevicesByUser };