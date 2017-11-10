import json

# AREA = "area"
AREA = "district"

START_YEAR = 1995
END_YEAR = 2017

def load_json_data(data):
    for year_num in range(START_YEAR, END_YEAR+1):
        year = str(year_num)
        with open("output/price_by_{}_{}.json".format(AREA, year), "r") as f:
            data[year] = json.load(f)
    return data

def get_area_data(all_data):
    area_data = {}
    for year_num in range(START_YEAR, END_YEAR+1):
        year = str(year_num)
        NUM_AREAS = len(all_data[year])
        for index in range(NUM_AREAS):
            if all_data[year][index][0] in area_data:
                area_data[all_data[year][index][0]][year] = all_data[year][index][1]
            else:
                area_data[all_data[year][index][0]] = {year: all_data[year][index][1]}

    return area_data

def convert_object_to_array(data):
    output = []
    for key in sorted(data.keys()):
        output.append([key, data[key]])
    return output

def main():
    all_data = load_json_data({})
    import ipdb; ipdb.set_trace()
    area_data = get_area_data(all_data)
    # output = convert_object_to_array(area_data)

    with open('all_years_price_by_{}.json'.format(AREA), 'w') as outfile:
        json.dump(area_data, outfile)

main()


# {
#     "AL": {
#         1995:
#     }
# }

# [["AL",{"1995": 556230.4258530184, "1996": 3134123, "1997": 143132}]