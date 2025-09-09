import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://leprive.com.pl";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    // Validar status
    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pending, confirmed, or cancelled' },
        { status: 400 }
      );
    }

    // Fazer a atualização no Strapi
    const strapiResponse = await fetch(`${API_URL}/api/bookings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          currentStatus: status
        }
      }),
    });

    if (!strapiResponse.ok) {
      const errorData = await strapiResponse.text();
      console.error('Strapi error:', errorData);
      return NextResponse.json(
        { error: 'Failed to update booking in Strapi' },
        { status: 500 }
      );
    }

    const updatedBooking = await strapiResponse.json();

    return NextResponse.json({
      success: true,
      booking: updatedBooking.data
    });

  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
