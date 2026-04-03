import supabase from "../../config/supabase/supabase";
import type { SB_UniversityOverviews } from "../models/universityOverviewsModel";


export const getAllUniversityOverviews = async (): Promise<SB_UniversityOverviews[]> => {
  const { data, error } = await supabase
    .from("university_overviews")
    .select("*");

  if (error) throw new Error(error.message);
  return data as SB_UniversityOverviews[];
};


export const getUniversityOverviewById = async (id: number): Promise<SB_UniversityOverviews> => {
  const { data, error } = await supabase
    .from("university_overviews")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as SB_UniversityOverviews;
};


export const createUniversityOverview = async (
  payload: Omit<SB_UniversityOverviews, "id">
): Promise<SB_UniversityOverviews> => {
  const { data, error } = await supabase
    .from("university_overviews")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as SB_UniversityOverviews;
};


export const updateUniversityOverview = async (
  id: number,
  payload: Partial<Omit<SB_UniversityOverviews, "id">>
): Promise<SB_UniversityOverviews> => {
  const { data, error } = await supabase
    .from("university_overviews")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as SB_UniversityOverviews;
};


export const deleteUniversityOverview = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("university_overviews")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
};