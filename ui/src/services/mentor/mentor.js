const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8001';

// Create/Update mentor profile
// Accepts either FormData (for profile with resume) or plain object (for JSON requests like hourly_rate)
export async function createMentorProfile(data) {
  try {
    const isFormData = data instanceof FormData;

    const options = {
      method: 'POST',
      credentials: 'include',
    };

    if (isFormData) {
      options.body = data;
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(data);
    }

    const res = await fetch(`${API_BASE}/api/mentor/profile`, options);
    const responseData = await res.json();

    if (!res.ok) {
      return { error: responseData.error || 'Failed to save mentor profile' };
    }
    return responseData;
  } catch (err) {
    console.error('createMentorProfile error', err);
    return { error: 'Network error' };
  }
}

// Get mentor profile
export async function getMentorProfile(userId) {
  try {
    const res = await fetch(`${API_BASE}/api/mentor/profile/${userId}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to fetch mentor profile' };
    }
    return data;
  } catch (err) {
    console.error('getMentorProfile error', err);
    return { error: 'Network error' };
  }
}

// List all mentors
export async function listMentors(filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters);
    const res = await fetch(`${API_BASE}/api/mentor/profile?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to fetch mentors' };
    }
    return data;
  } catch (err) {
    console.error('listMentors error', err);
    return { error: 'Network error' };
  }
}

// Create slot
export async function createSlot(slotData) {
  try {
    const res = await fetch(`${API_BASE}/api/mentor/slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(slotData),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to create slot' };
    }
    return data;
  } catch (err) {
    console.error('createSlot error', err);
    return { error: 'Network error' };
  }
}

// Get slots by mentor
export async function getSlotsByMentor(mentorId, filters = {}) {
  try {
    // Build query params, converting numbers to strings for URLSearchParams
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, String(filters[key]));
      }
    });

    const url = `${API_BASE}/api/mentor/slots/mentor/${mentorId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to fetch slots' };
    }
    return data;
  } catch (err) {
    console.error('getSlotsByMentor error', err);
    return { error: 'Network error' };
  }
}

// Update slot
export async function updateSlot(slotId, slotData) {
  try {
    const res = await fetch(`${API_BASE}/api/mentor/slots/${slotId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(slotData),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to update slot' };
    }
    return data;
  } catch (err) {
    console.error('updateSlot error', err);
    return { error: 'Network error' };
  }
}

// Delete slot
export async function deleteSlot(slotId) {
  try {
    const res = await fetch(`${API_BASE}/api/mentor/slots/${slotId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to delete slot' };
    }
    return data;
  } catch (err) {
    console.error('deleteSlot error', err);
    return { error: 'Network error' };
  }
}

// Get mentor booking requests
export async function getMentorRequests(mentorId, status = null) {
  try {
    const url = status
      ? `${API_BASE}/api/mentor/requests/${mentorId}?status=${status}`
      : `${API_BASE}/api/mentor/requests/${mentorId}`;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to fetch requests' };
    }
    return data;
  } catch (err) {
    console.error('getMentorRequests error', err);
    return { error: 'Network error' };
  }
}

// Update booking status (accept/reject)
export async function updateBookingStatus(bookingId, mentorId, status, meetingLink = null) {
  try {
    const res = await fetch(`${API_BASE}/api/mentor/requests/${bookingId}?mentor_id=${mentorId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status, meeting_link: meetingLink }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to update booking status' };
    }
    return data;
  } catch (err) {
    console.error('updateBookingStatus error', err);
    return { error: 'Network error' };
  }
}

// Get registration fee
export async function getRegistrationFee() {
  try {
    const res = await fetch(`${API_BASE}/api/registration-fee`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to fetch registration fee' };
    }
    return data;
  } catch (err) {
    console.error('getRegistrationFee error', err);
    return { error: 'Network error' };
  }
}

