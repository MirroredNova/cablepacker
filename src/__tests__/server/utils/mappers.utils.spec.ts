import { describe, it, expect } from 'vitest';
import {
  mapDBPresetToDomain,
  mapDBCableToDomain,
  mapPresetWithCables,
  mapDBResultToSavedResult,
} from '@/server/utils/mappers.utils';
import { DBPreset, DBCable, DBResult } from '@/types/database.types';
import { BoreResult, Circle, Point } from '@/types/algorithm.types';
import { TableRowData } from '@/types/table.types';
import { Preset, Cable } from '@/types/domain.types';

describe('Database Mappers Utilities', () => {
  describe('mapDBPresetToDomain', () => {
    it('should map database preset to domain preset', () => {
      const timestamp = '2023-04-15T10:30:00.000Z';
      const dbPreset: DBPreset = {
        ID: 123,
        NAME: 'Test Preset',
        CREATED_AT: timestamp,
        UPDATED_AT: timestamp,
      };

      const expected: Preset = {
        id: 123,
        name: 'Test Preset',
        createdAt: new Date(timestamp),
        updatedAt: new Date(timestamp),
      };

      const result = mapDBPresetToDomain(dbPreset);

      expect(result).toEqual(expected);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle different date formats', () => {
      const dbPreset: DBPreset = {
        ID: 123,
        NAME: 'Test Preset',
        CREATED_AT: '2023-04-15', // Different date format
        UPDATED_AT: '2023-04-15T10:30:00.000Z',
      };

      const result = mapDBPresetToDomain(dbPreset);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.getFullYear()).toBe(2023);
      expect(result.createdAt.getMonth()).toBe(3); // April is 3 (zero-based)
      expect(result.createdAt.getDate()).toBe(14);
    });
  });

  describe('mapDBCableToDomain', () => {
    it('should map database cable to domain cable', () => {
      const timestamp = '2023-04-15T10:30:00.000Z';
      const dbCable: DBCable = {
        ID: 456,
        PRESET_ID: 123,
        NAME: 'Cable Type A',
        CATEGORY: 'Power',
        DIAMETER: 10.5,
        CREATED_AT: timestamp,
        UPDATED_AT: timestamp,
      };

      const expected: Cable = {
        id: 456,
        presetId: 123,
        name: 'Cable Type A',
        category: 'Power',
        diameter: 10.5,
        createdAt: new Date(timestamp),
        updatedAt: new Date(timestamp),
      };

      const result = mapDBCableToDomain(dbCable);

      expect(result).toEqual(expected);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle null category field', () => {
      const dbCable: DBCable = {
        ID: 456,
        PRESET_ID: 123,
        NAME: 'Cable Type A',
        CATEGORY: null,
        DIAMETER: 10.5,
        CREATED_AT: '2023-04-15T10:30:00.000Z',
        UPDATED_AT: '2023-04-15T10:30:00.000Z',
      };

      const result = mapDBCableToDomain(dbCable);

      expect(result.category).toBeNull();
    });
  });

  describe('mapPresetWithCables', () => {
    it('should map preset with its associated cables', () => {
      const timestamp = '2023-04-15T10:30:00.000Z';
      const dbPreset: DBPreset = {
        ID: 123,
        NAME: 'Test Preset',
        CREATED_AT: timestamp,
        UPDATED_AT: timestamp,
      };

      const dbCables: DBCable[] = [
        {
          ID: 456,
          PRESET_ID: 123,
          NAME: 'Cable Type A',
          CATEGORY: 'Power',
          DIAMETER: 10.5,
          CREATED_AT: timestamp,
          UPDATED_AT: timestamp,
        },
        {
          ID: 457,
          PRESET_ID: 123,
          NAME: 'Cable Type B',
          CATEGORY: 'Data',
          DIAMETER: 5.2,
          CREATED_AT: timestamp,
          UPDATED_AT: timestamp,
        },
      ];

      const result = mapPresetWithCables(dbPreset, dbCables);

      // Check the preset properties
      expect(result.id).toBe(123);
      expect(result.name).toBe('Test Preset');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);

      // Check the cables array
      expect(result.cables).toHaveLength(2);
      expect(result.cables![0].id).toBe(456);
      expect(result.cables![0].name).toBe('Cable Type A');
      expect(result.cables![1].id).toBe(457);
      expect(result.cables![1].name).toBe('Cable Type B');
    });

    it('should handle empty cables array', () => {
      const dbPreset: DBPreset = {
        ID: 123,
        NAME: 'Test Preset',
        CREATED_AT: '2023-04-15T10:30:00.000Z',
        UPDATED_AT: '2023-04-15T10:30:00.000Z',
      };

      const result = mapPresetWithCables(dbPreset, []);

      expect(result.cables).toEqual([]);
    });
  });

  describe('mapDBResultToSavedResult', () => {
    it('should map database result to domain result', () => {
      const timestamp = '2023-04-15T10:30:00.000Z';

      // Create sample input cables
      const inputCables: TableRowData[] = [
        {
          id: '1',
          selectedCable: {
            id: 123,
            name: 'Cable A',
            diameter: 10,
            presetId: 1,
            category: 'Power',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          quantity: 2,
        },
      ];

      // Create sample result data
      const point: Point = { x: 0, y: 0 };
      const cableCircle: Circle = {
        name: 'Cable A',
        diameter: 10,
        radius: 5,
        coordinates: point,
        color: '#FF0000',
      };
      const boreCircle: Circle = {
        name: 'bore',
        diameter: 30,
        radius: 15,
        coordinates: point,
      };

      const resultData: BoreResult = {
        bore: boreCircle,
        cables: [cableCircle],
      };

      const dbResult: DBResult = {
        ID: 'ABC12345',
        INPUT_CABLES: inputCables,
        RESULT_DATA: resultData,
        SELECTED_PRESET_ID: 123,
        CABLE_COUNT: 2,
        BORE_DIAMETER: 35,
        CREATED_AT: timestamp,
      };

      const result = mapDBResultToSavedResult(dbResult);

      expect(result.id).toBe('ABC12345');
      expect(result.inputCables).toEqual(inputCables);
      expect(result.resultData).toEqual(resultData);
      expect(result.selectedPresetId).toBe(123);
      expect(result.cableCount).toBe(2);
      expect(result.boreDiameter).toBe(35);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toBe(timestamp);
    });

    it('should handle null values for optional fields', () => {
      const point: Point = { x: 0, y: 0 };
      const boreCircle: Circle = {
        name: 'bore',
        diameter: 30,
        radius: 15,
        coordinates: point,
      };

      const resultData: BoreResult = {
        bore: boreCircle,
        cables: [],
      };

      const dbResult: DBResult = {
        ID: 'ABC12345',
        INPUT_CABLES: [],
        RESULT_DATA: resultData,
        SELECTED_PRESET_ID: null,
        CABLE_COUNT: 0,
        BORE_DIAMETER: 35,
        CREATED_AT: '2023-04-15T10:30:00.000Z',
      };

      const result = mapDBResultToSavedResult(dbResult);

      expect(result.selectedPresetId).toBeNull();
    });
  });
});
