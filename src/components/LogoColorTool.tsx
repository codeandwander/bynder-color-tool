/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import BynderLogo from '@/app/assets/BynderLogo';
import ColorIcon from '@/app/assets/ColorIcon';
import SectorIcon from '@/app/assets/SectorIcon';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY as string;
const SPREADSHEET_ID = '1rW7H_iBMvjnEZPDq-dcLcmmxF1SLQOQOBbYJ0G6HBCg';
const RANGES = [
  'Totals - 143 Colours!A:C',
  'Sector - 143 Colours!A:D',
];

interface ColorData {
  color: string;
  colorUse: string;
  logosUsingColor: string;
}

interface SectorColorData {
  name: string;
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
        totalColors: totalColors.map(([color, colorUse, logosUsingColor]: any) => ({
          color, colorUse, logosUsingColor
        })),
        sectorColors: sectorColors.map(([name, color, colorUse, logosUsingColor]: any) => ({
          name, color, colorUse, logosUsingColor
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
    const colorStats = data.totalColors.find(item => item.color === selectedColor);
    if (colorStats) {
      const sectorData = data.sectorColors
        .filter(item => item.color === selectedColor)
        .sort((a, b) => parseFloat(b.colorUse) - parseFloat(a.colorUse))
        .slice(0, 5);
      setResults({
        type: 'color',
        color: selectedColor,
        colorUse: colorStats.colorUse,
        sectorData: sectorData
      });
    }
  };

  const handleSectorSubmit = () => {
    if (!data || !selectedSector) return;
    const sectorData = data.sectorColors
      .filter(item => item.name === selectedSector)
      .sort((a, b) => parseFloat(b.colorUse) - parseFloat(a.colorUse))
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
    <div className="max-w-2xl mx-auto w-full p-8 bg-blue-600 rounded-3xl">
      <div className="flex items-start mb-6">
        <BynderLogo className="w-24" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-8 max-w-sm">How unique is the color of your logo?</h1>
      {!results ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-white rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <ColorIcon className="mr-2 w-8" />
              <h2 className="text-xl font-semibold">Search by color</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">Select a color to see how many logos it appears in.</p>
            <Select onValueChange={handleColorSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a color" />
              </SelectTrigger>
              <SelectContent>
                {data.totalColors.map((color) => (
                  <SelectItem key={color.color} value={color.color}>
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: color.color }}
                      />
                      {color.color}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleColorSubmit} className="mt-4 bg-blue-600 font-bold">See results</Button>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <SectorIcon className="mr-2 w-8" />
              <h2 className="text-xl font-semibold">Search by sector</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">Choose a sector to discover the most popular logo colors.</p>
            <Select onValueChange={handleSectorSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(new Set(data.sectorColors.map(item => item.name))).map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSectorSubmit} className="mt-4 bg-blue-600 font-bold">See results</Button>
          </CardContent>
        </Card>
      </div>
      ) : (
        <Card className="bg-white">
          <CardContent className="pt-6">
            {results.type === 'color' ? (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  <span 
                    className="inline-block w-4 h-4 rounded-full mr-2" 
                    style={{backgroundColor: results.color}}
                  ></span>
                  {results.color} is used in {results.colorUse} of all logos.
                </h2>
                <p className="text-sm text-gray-600 mb-4">The data below shows how many logos in various sectors use this color:</p>
                <div className="space-y-2">
                  {results.sectorData.map((item: SectorColorData, index: number) => (
                    <div key={item.color} className={`flex justify-between items-center rounded-lg ${index === 0 ? 'bg-blue-500 text-white py-1.5 px-3 font-bold text-xl' : 'text-gray-700 py-0 px-3'}`}>
                      <span>{item.name}</span>
                      <span className={`px-2 py-1 rounded ${index === 0 ? 'bg-blue-500 text-white' : 'text-gray-700'}`}>
                        {item.colorUse}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  Below is a list of the most popular colors used within the {results.name} industry.
                </h2>
                <div className="space-y-2">
                  {results.data.map((item: SectorColorData, index: number) => (
                    <div key={item.color} className={`flex justify-between items-center rounded-lg ${index === 0 ? 'bg-blue-500 text-white py-1.5 px-3 font-bold text-xl' : 'text-gray-700 py-0 px-3'}`}>
                      <span className="flex items-center">
                        <span 
                          className={`inline-block w-4 h-4 rounded-full mr-2 capitalize`}
                          style={{backgroundColor: item.color}}
                        ></span>
                        {item.color}
                      </span>
                      <span className={`px-2 py-1 rounded`}>
                        {item.colorUse}
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