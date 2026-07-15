import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')

  if (!address || address.trim().length < 3) {
    return NextResponse.json({ error: 'כתובת קצרה מדי' }, { status: 400 })
  }

  try {
    const query = encodeURIComponent(`${address}, ישראל`)
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5&countrycodes=il&addressdetails=1`

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

    const results = data.map((item: any) => {
      const addr = item.address || {}
      const road = addr.road || addr.pedestrian || addr.footway || ''
      const houseNumber = addr.house_number || ''
      const city = addr.city || addr.town || addr.village || addr.municipality || ''
      const streetLine = [road, houseNumber].filter(Boolean).join(' ')
      const cleanLabel = [streetLine, city].filter(Boolean).join(', ')

      return {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        display_name: cleanLabel || item.display_name,
      }
    })

    return NextResponse.json({
      lat: results[0].lat,
      lng: results[0].lng,
      display_name: results[0].display_name,
      results,
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}
