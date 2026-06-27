import React from "react";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

export const CardSkeleton = () => {
  return (
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map((i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={40} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <Box sx={{ width: "100%" }}>
      <Skeleton variant="rectangular" height={56} sx={{ borderRadius: "8px 8px 0 0" }} />
      {[...Array(rows)].map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={52} sx={{ mt: 0.5 }} />
      ))}
    </Box>
  );
};

export const FormSkeleton = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" width="30%" height={32} sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Grid item xs={12} md={6} key={i}>
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
        <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
      </Box>
    </Box>
  );
};

export default { CardSkeleton, TableSkeleton, FormSkeleton };
