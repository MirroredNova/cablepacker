import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help',
};

export default function Help() {
  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h6" fontWeight="bold">Introduction</Typography>
        <Typography variant="body1">Welcome to the Underground Cable Packer!</Typography>
        <Typography variant="body1">
          This is a web tool designed to help utility companies and their contractors for underground cable projects.
          The tool can calculate the minimum bore size required for a given list of cables and ducts.
          You can also save the results or share them through a unique URL link.
        </Typography>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="h6" fontWeight="bold">
          Calculator Page
        </Typography>
        <Typography variant="body1">
          The main calculator page lets you can input a set of
          cables and find the minimum bore size required to pack them.
        </Typography>
        <Typography variant="body1">
          To get started, you may choose a preset list of cables from the &quot;Preset&quot; dropdown menu.
          There may be a preset specific to your project or company. If you do not see a fitting
          preset, you may contact the administrators to create a new one.
        </Typography>
        <Typography variant="body1">
          You can populate the main table below with the list of cables to be packed.
          Click &quot;Add Cable&quot; to add a new cable type to the table.
          You can select a preset cable or enter in any value.
          If you select a preset, the diameter will be set automatically.
          Next, set the quantity of that specific cable you&apos;d like to pack.
          Repeat until all desired cable types are added.
          Lastly, click &quot;Generate Bore&quot; to get the result! A preview will be shown as well.
        </Typography>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="h6" fontWeight="bold">Sharing and Retrieving a result</Typography>
        <Typography variant="body1">
          Once a calculation is completed, you may share the result by downloading
          the preview image or share a unique URL for this result.
          You can email this link using the &quot;Email Results&quot; button.
        </Typography>
        <Typography variant="body1">
          The unique URl will automatically prefill the table and show you the results.
          If you have a result ID instead of the URL you can enter the ID into the search field.
        </Typography>
      </Stack>
    </Stack>
  );
}
