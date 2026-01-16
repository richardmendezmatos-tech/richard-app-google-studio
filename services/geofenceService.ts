import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// 📍 COORDINATES: UPDATE THESE WITH YOUR REAL DEALER LOCATION
// 📍 COORDINATES: 9RC9+WF Bayamón (Richard Automotive)
const DEALER_COORDS = {
    latitude: 18.3986,
    longitude: -66.1557
};

const GEOFENCE_RADIUS_METERS = 500; // Trigger when within 500m

// Helper to calculate distance in meters (Haversine Formula)
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d * 1000; // Return meters
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export const startGeofenceMonitoring = async () => {
    if (!Capacitor.isNativePlatform()) {
        console.log("Geofencing skipped (Web Platform)");
        return;
    }

    try {
        const hasPermission = await LocalNotifications.requestPermissions();
        const locPermission = await Geolocation.requestPermissions();

        if (hasPermission.display !== 'granted' || locPermission.location !== 'granted') {
            console.log("Permissions denied for Geofencing");
            return;
        }

        // Watch Position
        Geolocation.watchPosition({ enableHighAccuracy: true, timeout: 5000 }, (position) => {
            if (position) {
                const distance = getDistanceFromLatLonInMeters(
                    position.coords.latitude,
                    position.coords.longitude,
                    DEALER_COORDS.latitude,
                    DEALER_COORDS.longitude
                );

                console.log(`Distance to dealer: ${Math.floor(distance)}m`);

                if (distance < GEOFENCE_RADIUS_METERS) {
                    triggerWelcomeAlert();
                }
            }
        });

    } catch (error) {
        console.error("Geofence Error:", error);
    }
};

let lastAlertTime = 0;

const triggerWelcomeAlert = async () => {
    const now = Date.now();
    // Prevent spamming: Max 1 alert per hour
    if (now - lastAlertTime < 3600000) return;

    lastAlertTime = now;

    await LocalNotifications.schedule({
        notifications: [{
            title: "👋 ¡Bienvenido a Richard Auto!",
            body: "Abre tu App para ver las ofertas exclusivas de hoy.",
            id: 1,
            schedule: { at: new Date(Date.now() + 100) }, // Now
            sound: undefined,
            attachments: undefined,
            actionTypeId: "",
            extra: null
        }]
    });
};
