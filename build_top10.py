import csv
import json
import os
from collections import defaultdict

def main():
    players = {}
    print("Reading players...")
    with open('temp_data/atp_players.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) > 3:
                # player_id, name_first, name_last
                id = row[0]
                name = f"{row[1]} {row[2]}".strip()
                players[id] = name
    
    dates_top10 = defaultdict(list)

    files = ['temp_data/atp_rankings_00s.csv', 'temp_data/atp_rankings_10s.csv', 'temp_data/atp_rankings_20s.csv']
    
    for file in files:
        if not os.path.exists(file):
            print(f"Skipping {file}, not found.")
            continue
        print(f"Reading {file}...")
        with open(file, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            # format usually: ranking_date, rank, player_id, ranking_points, tours
            # But the first line is header?
            for row in reader:
                if len(row) < 3: continue
                # check header
                if row[0] == 'ranking_date': continue
                
                date = row[0]
                try:
                    rank = int(row[1])
                except:
                    continue
                    
                if rank <= 10:
                    player_id = row[2]
                    name = players.get(player_id, "Unknown Player")
                    dates_top10[date].append({"rank": rank, "name": name})

    print("Sorting and formatting...")
    # Sort them by rank
    formatted_data = {}
    for date, top10 in dates_top10.items():
        # Only keep if we have roughly a top 10 (at least size 10)
        top10_sorted = sorted(top10, key=lambda x: x["rank"])
        formatted_data[date] = top10_sorted[:10]
        
    print(f"Saving {len(formatted_data)} weeks of data to src/data/atp_weekly_top10.json...")
    with open('src/data/atp_weekly_top10.json', 'w', encoding='utf-8') as f:
        json.dump(formatted_data, f, separators=(',', ':'))

if __name__ == '__main__':
    main()
