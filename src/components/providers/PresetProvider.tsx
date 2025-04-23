'use client';

import React, { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { createCableAction, deleteCableAction, updateCableAction } from '@/server/actions/cables.actions';
import {
  createPresetAction,
  deletePresetAction,
  getAllPresetsWithCablesAction,
  updatePresetAction,
} from '@/server/actions/presets.actions';
import { CreateCableInput, CreatePresetInput, Preset, UpdateCableInput } from '@/types/domain.types';
import { PresetContext } from '@/context/PresetContext';

export default function PresetProvider({ children }: PropsWithChildren) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetsLoaded, setPresetsLoaded] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resetPresets = useCallback(() => {
    setSelectedPreset(null);
  }, []);

  // Load presets
  const loadPresets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAllPresetsWithCablesAction();
      if (result.success) {
        setPresets(result.data || []);
        setPresetsLoaded(true);
      } else {
        setError(result.error || 'An error occurred while loading presets');
      }
    } catch (e: any) {
      console.error('Failed to load presets:', e);
      setError(e.message || 'An unexpected error occurred while loading presets');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load presets on mount
  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  const addPreset = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);

    try {
      const newPreset: CreatePresetInput = { name };
      const res = await createPresetAction(newPreset);

      if (res.success && res.data) {
        setPresets((currentPresets) => [...currentPresets, res.data!]);
      } else {
        setError(res.error || 'Failed to create preset');
      }
    } catch (e: any) {
      console.error('Error creating preset:', e);
      setError(e.message || 'An unexpected error occurred while creating preset');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreset = useCallback(
    async (id: number, updates: Partial<Preset>) => {
      setLoading(true);
      setError(null);

      try {
        // Optimistic update
        setPresets((currentPresets) => (
          currentPresets.map((preset) => (preset.id === id ? { ...preset, ...updates } : preset))
        ));

        if (selectedPreset?.id === id) {
          setSelectedPreset((current) => (current ? { ...current, ...updates } : null));
        }

        // Actual API call
        const res = await updatePresetAction(id, updates);

        if (!res.success) {
          // Rollback on failure
          loadPresets();
          setError(res.error || 'Failed to update preset');
        }
      } catch (e: any) {
        // Rollback on exception
        loadPresets();
        console.error('Error updating preset:', e);
        setError(e.message || 'An unexpected error occurred while updating preset');
      } finally {
        setLoading(false);
      }
    },
    [selectedPreset, loadPresets],
  );

  const deletePreset = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);

      try {
        // Optimistic update
        const previousPresets = [...presets];
        setPresets((currentPresets) => currentPresets.filter((preset) => preset.id !== id));

        if (selectedPreset?.id === id) {
          setSelectedPreset(null);
        }

        // Actual API call
        const res = await deletePresetAction(id);

        if (!res.success) {
          // Rollback on failure
          setPresets(previousPresets);
          setError(res.error || 'Failed to delete preset');
        }
      } catch (e: any) {
        console.error('Error deleting preset:', e);
        setError(e.message || 'An unexpected error occurred while deleting preset');
      } finally {
        setLoading(false);
      }
    },
    [presets, selectedPreset],
  );

  const addCableToPreset = useCallback(
    async (presetId: number, cable: CreateCableInput) => {
      setLoading(true);
      setError(null);

      try {
        const res = await createCableAction(cable);

        if (res.success && res.data) {
          setPresets((currentPresets) => currentPresets.map((preset) => {
            if (preset.id === presetId) {
              return {
                ...preset,
                cables: [...(preset.cables || []), res.data!],
              };
            }
            return preset;
          }));

          // Also update selectedPreset if needed
          if (selectedPreset?.id === presetId) {
            setSelectedPreset((current) => {
              if (!current) return null;
              return {
                ...current,
                cables: [...(current.cables || []), res.data!],
              };
            });
          }
        } else {
          setError(res.error || 'Failed to add cable');
        }
      } catch (e: any) {
        console.error('Error adding cable:', e);
        setError(e.message || 'An unexpected error occurred while adding cable');
      } finally {
        setLoading(false);
      }
    },
    [selectedPreset],
  );

  const editCable = useCallback(
    async (cableId: number, updates: Partial<UpdateCableInput>) => {
      setLoading(true);
      setError(null);

      try {
        // Find which preset contains this cable
        const targetPreset = presets.find((preset) => preset.cables?.some((cable) => cable.id === cableId));

        if (!targetPreset) {
          setError('Cable not found in any preset');
          setLoading(false);
          return;
        }

        // Keep reference to original cable for rollback
        const originalCable = targetPreset.cables?.find((c) => c.id === cableId);

        // Optimistic update
        setPresets((currentPresets) => currentPresets.map((preset) => {
          if (preset.cables?.some((cable) => cable.id === cableId)) {
            return {
              ...preset,
              cables: preset.cables.map((cable) => (cable.id === cableId ? { ...cable, ...updates } : cable)),
            };
          }
          return preset;
        }));

        // Update selectedPreset if needed
        if (selectedPreset?.id === targetPreset.id) {
          setSelectedPreset((current) => {
            if (!current || !current.cables) return current;
            return {
              ...current,
              cables: current.cables.map((cable) => (cable.id === cableId ? { ...cable, ...updates } : cable)),
            };
          });
        }

        // Actual API call
        const res = await updateCableAction(cableId, updates);

        if (!res.success) {
          // Rollback on failure
          if (originalCable) {
            // Reset to original state
            setPresets((currentPresets) => currentPresets.map((preset) => {
              if (preset.id === targetPreset.id) {
                return {
                  ...preset,
                  cables: preset.cables?.map((cable) => (cable.id === cableId ? originalCable : cable)),
                };
              }
              return preset;
            }));

            // Reset selectedPreset if needed
            if (selectedPreset?.id === targetPreset.id) {
              setSelectedPreset((current) => {
                if (!current || !current.cables) return current;
                return {
                  ...current,
                  cables: current.cables.map((cable) => (cable.id === cableId ? originalCable : cable)),
                };
              });
            }
          }
          setError(res.error || 'Failed to update cable');
        }
      } catch (e: any) {
        console.error('Error updating cable:', e);
        setError(e.message || 'An unexpected error occurred while updating cable');
        // Full reload as fallback
        loadPresets();
      } finally {
        setLoading(false);
      }
    },
    [presets, selectedPreset, loadPresets],
  );

  const deleteCableFromPreset = useCallback(
    async (presetId: number, cableId: number) => {
      setLoading(true);
      setError(null);

      try {
        // Find the cable we're about to delete for potential rollback
        const targetPreset = presets.find((p) => p.id === presetId);
        const cableToDelete = targetPreset?.cables?.find((c) => c.id === cableId);

        if (!targetPreset || !cableToDelete) {
          setError('Cable not found');
          setLoading(false);
          return;
        }

        // Optimistic update
        setPresets((currentPresets) => currentPresets.map((preset) => {
          if (preset.id === presetId) {
            return {
              ...preset,
              cables: preset.cables?.filter((cable) => cable.id !== cableId),
            };
          }
          return preset;
        }));

        // Update selectedPreset if needed
        if (selectedPreset?.id === presetId) {
          setSelectedPreset((current) => {
            if (!current) return null;
            return {
              ...current,
              cables: current.cables?.filter((cable) => cable.id !== cableId),
            };
          });
        }

        // Actual API call
        const res = await deleteCableAction(cableId);

        if (!res.success) {
          // Rollback on failure
          setPresets((currentPresets) => currentPresets.map((preset) => {
            if (preset.id === presetId && cableToDelete) {
              return {
                ...preset,
                cables: [...(preset.cables || []), cableToDelete],
              };
            }
            return preset;
          }));

          // Restore in selectedPreset if needed
          if (selectedPreset?.id === presetId) {
            setSelectedPreset((current) => {
              if (!current) return null;
              return {
                ...current,
                cables: [...(current.cables || []), cableToDelete],
              };
            });
          }

          setError(res.error || 'Failed to delete cable');
        }
      } catch (e: any) {
        console.error('Error deleting cable:', e);
        setError(e.message || 'An unexpected error occurred while deleting cable');
        loadPresets(); // Reload everything as fallback
      } finally {
        setLoading(false);
      }
    },
    [presets, selectedPreset, loadPresets],
  );

  const value = useMemo(
    () => ({
      presets,
      presetsLoaded,
      selectedPreset,
      loading,
      error,
      setSelectedPreset,
      resetPresets,
      loadPresets,
      addPreset,
      updatePreset,
      deletePreset,
      addCableToPreset,
      editCable,
      deleteCableFromPreset,
    }),
    [
      addCableToPreset,
      addPreset,
      deleteCableFromPreset,
      deletePreset,
      editCable,
      error,
      loadPresets,
      loading,
      presets,
      presetsLoaded,
      resetPresets,
      selectedPreset,
      updatePreset,
    ],
  );

  return <PresetContext.Provider value={value}>{children}</PresetContext.Provider>;
}
