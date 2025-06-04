// Placeholder exports for @shared/schema
export const users = {};
export const pets = {};
export const fosterApplications = {};
export const trackingData = {};
export const notifications = {};
export const reviews = {};
export const cmsPages = {};
export const securityLogs = {};

export type User = any;
export type InsertUser = any;
export type Pet = any;
export type InsertPet = any;
export type FosterApplication = any;
export type InsertFosterApplication = any;
export type TrackingData = any;
export type InsertTrackingData = any;
export type Notification = any;
export type InsertNotification = any;
export type Review = any;
export type InsertReview = any;
export type CmsPage = any;
export type InsertCmsPage = any;
export type SecurityLog = any;
export type InsertSecurityLog = any;

import { z } from "zod";

export const insertPetSchema = z.object({});
export const insertFosterApplicationSchema = z.object({});
export const insertReviewSchema = z.object({});
export const insertCmsPageSchema = z.object({});
export const insertTrackingDataSchema = z.object({});
export const insertNotificationSchema = z.object({}); 