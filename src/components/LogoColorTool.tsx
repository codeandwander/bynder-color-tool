/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState, useEffect } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BynderLogo from '@/app/assets/BynderLogo';
import ColorIcon from '@/app/assets/ColorIcon';
import SectorIcon from '@/app/assets/SectorIcon';

import { aeonikBold } from "@/app/fonts";

import { SearchableSelect } from './SearchableSelect';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY as string;
const SPREADSHEET_ID = '1rW7H_iBMvjnEZPDq-dcLcmmxF1SLQOQOBbYJ0G6HBCg';
const RANGES = [
  'Totals - 143 Colours!A:D',
  'Sector - 143 Colours!A:E',
];

interface ColorData {
  colorName: string;
  color: string;
  colorUse: string;
  logosUsingColor: string;
}

interface SectorColorData {
  name: string;
  colorName: string;
  color: string;
  colorUse: string;
  logosUsingColor: string;
}

interface SheetData {
  totalColors: ColorData[];
  sectorColors: SectorColorData[];
}

const LogoColorTool: React.FC = () => {
  const [data, setData] = useState<SheetData | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const responses = await Promise.all(RANGES.map(range => 
        fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`)
          .then(res => res.json())
      ));

      const [totalColors, sectorColors] = responses.map(res => res.values.slice(1));

      setData({
        totalColors: totalColors.map(([colorName, color, colorUse, logosUsingColor]: any) => ({
          colorName, color, colorUse, logosUsingColor
        })),
        sectorColors: sectorColors.map(([name, colorName, color, colorUse, logosUsingColor]: any) => ({
          name, colorName,color, colorUse, logosUsingColor
        })),
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleColorSelect = (value: string) => {
    setSelectedColor(value);
  };

  const handleSectorSelect = (value: string) => {
    setSelectedSector(value);
  };

  const handleColorSubmit = () => {
    if (!data || !selectedColor) return;
    const colorStats = data.totalColors.find(item => item.colorName === selectedColor);
    if (colorStats) {
      const sectorData = data.sectorColors
        .filter(item => item.colorName === selectedColor)
        .sort((a, b) => parseFloat(b.logosUsingColor) - parseFloat(a.logosUsingColor))
        .slice(0, 5);
      setResults({
        type: 'color',
        color: selectedColor,
        logosUsingColor: colorStats.logosUsingColor,
        sectorData: sectorData
      });
    }
  };

  const handleSectorSubmit = () => {
    if (!data || !selectedSector) return;
    const sectorData = data.sectorColors
      .filter(item => item.name === selectedSector)
      .sort((a, b) => parseFloat(b.logosUsingColor) - parseFloat(a.logosUsingColor))
      .slice(0, 5);
    setResults({ type: 'sector', name: selectedSector, data: sectorData });
  };

  const resetSearch = () => {
    setSelectedColor(null);
    setSelectedSector(null);
    setResults(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-2xl mx-auto w-full p-8 bg-[#126DFE] rounded-3xl">
      <div className="flex items-start mb-6">
        <BynderLogo className="w-24" />
      </div>
      <h1 className={`text-4xl font-bold text-white mb-8 max-w-sm ${aeonikBold.className}`}>How unique is the color of your logo?</h1>
      {!results ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-white rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <ColorIcon className="mr-2 w-8" />
              <h2 className={`text-xl font-semibold ${aeonikBold.className}`}>Search by color</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">Select a color to see how many logos it appears in.</p>
            <SearchableSelect
              options={data.totalColors.map((color) => ({
                value: color.colorName,
                label: (
                  <div className="flex items-center">
                    <div
                      className="w-5 h-5 rounded-sm mr-2 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]"
                      style={{ backgroundColor: color.color }}
                    />
                    {color.colorName}
                  </div>
                ),
              }))}
              placeholder="Select a color"
              onValueChange={handleColorSelect}
              searchTerm={selectedColor || ''}
            />
            <Button onClick={handleColorSubmit} className="mt-4 bg-[#126DFE] font-bold">See results</Button>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <SectorIcon className="mr-2 w-8" />
              <h2 className={`text-xl font-semibold ${aeonikBold.className}`}>Search by sector</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">Choose a sector to discover the most popular logo colors.</p>
            <SearchableSelect
              options={Array.from(new Set(data.sectorColors.map(item => item.name))).map((sector) => ({
                value: sector,
                label: sector,
              }))}
              placeholder="Select sector"
              onValueChange={handleSectorSelect}
              searchTerm={selectedSector || ''}
            />
            <Button onClick={handleSectorSubmit} className="mt-4 bg-[#126DFE] font-bold">See results</Button>
          </CardContent>
        </Card>
      </div>
      ) : (
        <Card className="bg-white">
          <CardContent className="pt-6">
            {results.type === 'color' ? (
              <>
                <div className="flex items-center mb-4 p-3 pb-0">
                  <span 
                    className="inline-block w-5 h-5 rounded mr-2 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]" 
                    style={{backgroundColor: results.color.replace(/ /g, '').toLowerCase()}}
                  ></span>
                  <h2 className="text-xl">
                    <span className="font-semibold">{results.color}</span> is used in <span className="font-semibold">{results.logosUsingColor}</span> of all logos.
                  </h2>
                </div>
                <p className="text-sm text-gray-500 mb-6 px-3">The data below shows how many logos in various sectors use this color:</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-gray-500 px-3">
                    <span className="flex-1">Color</span>
                    <span className="w-1/5 px-2 py-1 rounded">Logos</span>
                  </div>
                  {results.sectorData.map((item: SectorColorData, index: number) => (
                    <div key={item.color} className={`flex justify-between items-center rounded-lg ${index === 0 ? 'bg-[#126DFE] text-white py-1.5 px-3 font-bold text-xl' : 'text-gray-700 py-0 px-3'}`}>
                      <span className="flex-1">{item.name}</span>
                      <span className={`w-1/5 px-2 py-1 rounded ${index === 0 ? 'bg-[#126DFE] text-white' : 'text-gray-700'}`}>
                        {item.logosUsingColor}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl mb-4">
                  Below is a list of the most popular colors used within the <span className="font-semibold">{results.name}</span> sector.
                </h2>
                <div className="space-y-2">
                <div className="flex justify-between items-center text-gray-500 px-3">
                    <span className="flex-1">Sector</span>
                    <span className="w-1/5 px-2 py-1 rounded">Logos</span>
                  </div>
                  {results.data.map((item: SectorColorData, index: number) => (
                    <div key={item.color} className={`flex justify-between items-center rounded-lg ${index === 0 ? 'bg-[#126DFE] text-white py-1.5 px-3 font-bold text-xl' : 'text-gray-700 py-0 px-3'}`}>
                      <span className="flex items-center">
                        <span 
                          className={`inline-block w-5 h-5 rounded mr-2 capitalize`}
                          style={{backgroundColor: item.color}}
                        ></span>
                        {item.colorName}
                      </span>
                      <span className={`px-2 py-1 rounded`}>
                        {item.logosUsingColor}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
      {results && (
        <div className="flex justify-center">
          <Button onClick={resetSearch} className="mt-4 bg-black text-white font-bold">
            Start again
          </Button>
        </div>
      )}
    </div>
  );
};

export default LogoColorTool;