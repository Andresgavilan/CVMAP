import psycopg2
import json

# Connect to your postgres DB
conn = psycopg2.connect("dbname=CVMAP25 user=postgres password=2525CVMAPAFGO$ host=localhost")

# Open a cursor to perform database operations
cur = conn.cursor()

# Execute a query
cur.execute("SELECT * FROM geo_data")

# Retrieve query results
records = cur.fetchall()

# Convert the data to GeoJSON format
geojson = {
    "type": "FeatureCollection",
    "features": []
}

for record in records:
    feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [record[9], record[8]]  # longitude, latitude
        },
        "properties": {
            "Where": record[1],
            "Title": record[2],
            "Date": record[3],
            "City": record[4],
            "Subtitle": record[5],
            "Description": record[6],
            "More_Info" : record[7]
        },
        "id": record[0]
    }
    geojson["features"].append(feature)

# Save the GeoJSON to a file
with open('Dataprocess/CVMAP.geojson', 'w') as f:
    json.dump(geojson, f, indent=4)

# Close communication with the database
cur.close()
conn.close()