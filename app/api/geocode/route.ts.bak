import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')

  if (!address || address.trim().length < 3) {
    return NextResponse.json({ error: 'כתובת קצרה מדי' }, { status: 400 })
  }

  try {
    const query = encodeURIComponent(`${address}, ישראל`)
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=il`

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'HoodDo/1.0 (neighborhood task app)',
        'Accept-Language': 'he',
      },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'שגיאה בשירות המיקום' }, { status: 502 })
    }

    const data = await res.json()

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'כתובת לא נמצאה' }, { status: 404 })
    }

    const { lat, lon, display_name } = data[0]

    return NextResponse.json({
      lat: parseFloat(lat),
      lng: parseFloat(lon),
      display_name,
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}
