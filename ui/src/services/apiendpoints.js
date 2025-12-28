export const API_URL = 'http://localhost:8001/api/';
export const APIURL = API_URL;

export const APIENDPOINTS = {
    // Authentication
    signup: 'users/signup',
    login: 'auth/login',
    sendOTP: 'auth/send-otp',
    verifyOTP: 'auth/verify-otp',
    logout: 'auth/logout',
    checkSession: 'auth/check-session',

    // User Profile
    createUserProfile: 'profile',
    getUserProfile: 'profile',

    // Mentor Profile
    createMentorProfile: 'mentor/profile',
    getMentorProfile: 'mentor/profile',
    listMentors: 'mentor/profile',

    // Mentor Slots
    createSlot: 'mentor/slots',
    getSlots: 'mentor/slots',
    getSlotsByMentor: 'mentor/slots/mentor',
    updateSlot: 'mentor/slots',
    deleteSlot: 'mentor/slots',

    // Mentor Discovery
    discoverMentors: 'mentors',

    // Bookings
    bookSlot: 'bookings',
    getUserBookings: 'bookings/user',
    getMentorBookings: 'bookings/mentor',

    // Payment
    paymentWebhook: 'payment/webhook',
    verifyPayment: 'payment/verify',
    paymentCallback: 'payment/callback',
    getPaymentByBooking: 'payment/booking',
    createPaymentSession: 'payment/session',
    createBooking: 'payment/payout',

    // Reports/Feedback
    submitFeedback: 'reports',
    getMentorFeedback: 'reports/mentor',
    getBookingFeedback: 'reports/booking',

    // Progress
    addProgress: 'progress',
    getUserProgress: 'progress',

    // AI Interactions
    askAI: 'interact/ask',
    getAIHistory: 'interact/history',

    // Mentor Requests
    getMentorRequests: 'mentor/requests',
    updateBookingStatus: 'mentor/requests',

    // User Sessions
    getUserUpcomingSessions: 'user/sessions/upcoming',
    getUserSessionHistory: 'user/sessions/history',
}