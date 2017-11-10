import argparse
import numpy as np
import pandas as pd
import re

HEADERS = ["TID", "Price", "Date", "Postcode", "Prop. Type", "New?", "Duration", "PAON", "SAON", "Street", "Locality", "Town_City", "District", "County", "PPD", "Record_Status"]

def setup_args_parser():
    parser = argparse.ArgumentParser(description='Generate json files from.')
    parser.add_argument('ppcsvs', type=str, nargs='+',
                    help='Land registry price paid csv files')
    parser.add_argument('-y', '--year', type=str,
                    help='give the year the data is for')

    return parser.parse_args()

def read_csvs_to_df(csvs):
    dfs = []
    for csv in csvs:
        df = pd.read_csv(csv, parse_dates=True, names=HEADERS)
        dfs.append(df)
    return pd.concat(dfs, ignore_index=True)

def get_avg_price_by_area(df):
    return df['Price'].groupby(df['Postcode'].map(lambda pcode: re.search('[A-Z]*', pcode).group(0))).aggregate(np.mean)

def get_avg_price_by_district(df):
    return df['Price'].groupby(df['Postcode'].map(lambda pcode: pcode.split(" ")[0])).aggregate(np.mean)

def main():
    args = setup_args_parser()
    df = read_csvs_to_df(args.ppcsvs)
    df = df.dropna(subset=['Postcode'])
    avg_price_by_area = get_avg_price_by_area(df)
    avg_price_by_district = get_avg_price_by_district(df)

    avg_price_by_area.to_frame().reset_index().to_json('output/price_by_area_{}.json'.format(args.year), orient='values')
    avg_price_by_district.to_frame().reset_index().to_json('output/price_by_district_{}.json'.format(args.year), orient='values')

main()