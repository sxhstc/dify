---
description: Applies the gcommon-next component library design system styles and tokens to generated UI code. Use this rule when generating or modifying UI components to ensure consistency.
globs: **/*.{vue,css,scss,html,ts,tsx}
---

# gcommon-next Design System Guide

This rule defines the design tokens and style guidelines for the `gcommon-next` component library. Use these specifications when generating UI code, prototypes, or refactoring styles.

## 1. Core Color System (核心色彩系统)

Strictly use the following Hex codes. Do not use approximate colors.

### Brand Colors
- **Primary**: `#3081F2` (Blue)
  - Hover: `#599AF5`
  - Active: `#246FD8`
  - Disabled: `#AFCFFC`
- **Success**: `#14CC52` (Green)
- **Warning**: `#FFAA33` (Orange)
- **Danger/Error**: `#F24130` (Red)
- **Info**: `#8C929A` (Grey)

### Neutral System (Based on Cold Grey `#000D1F`)

#### Text Colors
- **Primary Text** (Titles/Body): `rgba(0, 13, 31, 0.85)`
- **Regular Text** (Body): `rgba(0, 13, 31, 0.65)`
- **Secondary Text** (Auxiliary): `rgba(0, 13, 31, 0.45)`
- **Placeholder/Disabled**: `rgba(0, 13, 31, 0.25)`

#### Border Colors
- **Default Border**: `#D9DBDE`
- **Light Border**: `#E5E6E8`
- **Lighter Border**: `#F2F3F4`

#### Background/Fill Colors
- **Page Background**: `#FAFAFB`
- **Default Component Background**: `#F7F7F8`
- **White Background**: `#FFFFFF`
- **Disabled Background**: `#F2F3F4`

## 2. Typography (排版系统)

- **Font Stack**: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Helvetica, Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif`

### Font Sizes
- **Extra Large**: `20px` (Big Titles)
- **Large**: `18px`
- **Medium**: `16px` (Subtitles/Emphasis)
- **Base**: `14px` (Default Body)
- **Small**: `13px`
- **Extra Small**: `12px` (Auxiliary Text)

### Font Weights
- **Regular**: `400`
- **Semibold**: `600`

## 3. Size & Spacing (尺寸与间距)

### Component Heights (Standard)
- **Large**: `40px`
- **Medium**: `36px`
- **Default/Small**: `32px` (Standard Default)
- **Mini**: `28px`

### Border Radius
- **Large**: `12px` (Cards, Modals)
- **Medium**: `8px` (Containers)
- **Base/Small**: `6px` (Buttons, Inputs)
- **Mini**: `4px`
- **Round**: `20px` (Capsule)

### Shadows
- **S1 (Lighter)**: `0px 1px 4px 0px rgba(0,13,31,0.10)`
- **S2 (Light)**: `0px 8px 16px 0px rgba(0,13,31,0.10)`
- **S3 (Base)**: `0px 12px 32px 0px rgba(0,13,31,0.10)`
- **S4 (Dark)**: `0px 16px 48px 0px rgba(0,13,31,0.10)` (Modals)

## 4. Component Specifics (组件规范)

### Buttons
- **Height**: `32px` (Default)
- **Radius**: `6px`
- **Padding**: `9px 20px`
- **Font Size**: `14px`
- **Primary Style**: Bg `#3081F2`, Text `#FFFFFF`, No Border.
- **Default Style**: Bg `#FFFFFF`, Border `#D9DBDE`, Text `rgba(0,13,31,0.65)`.

### Inputs
- **Height**: `32px` (Default)
- **Radius**: `6px`
- **Padding**: `0 12px`
- **Border**: Default `#D9DBDE`, Focus `#3081F2`.
- **Placeholder**: `rgba(0, 13, 31, 0.25)`

### Cards
- **Background**: `#FFFFFF`
- **Radius**: `12px`
- **Border**: `1px solid #E5E6E8`
- **Padding**: `24px`

### Tables
- **Header Bg**: `#F7F7F8`
- **Header Text**: `rgba(0, 13, 31, 0.85)`
- **Row Hover**: `#FAFAFB`

### Dialogs/Modals
- **Radius**: `12px`
- **Shadow**: S4 (Dark)
- **Padding**: `24px`
- **Title Size**: `16px`

## 5. Implementation Rules

1.  **CSS Variables**: When possible, use the CSS variables defined in the project (e.g., `var(--el-color-primary)`) instead of hardcoded hex values, unless generating standalone prototypes without the full CSS environment.
2.  **Flexbox**: Prefer Flexbox for layouts.
3.  **BEM**: Use BEM naming convention with the `el-` namespace (e.g., `el-button__inner`).
