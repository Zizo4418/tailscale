// Copyright (c) Tailscale Inc & AUTHORS
// SPDX-License-Identifier: BSD-3-Clause

import cx from "classnames"
import React from "react"
import { apiFetch } from "src/api"
import ACLTag from "src/components/acl-tag"
import * as Control from "src/components/control-components"
import NiceIP from "src/components/nice-ip"
import { UpdateAvailableNotification } from "src/components/update-available"
import { NodeData } from "src/hooks/node-data"
import Button from "src/ui/button"
import QuickCopy from "src/ui/quick-copy"
import { useLocation } from "wouter"

export default function DeviceDetailsView({
  readonly,
  node,
}: {
  readonly: boolean
  node: NodeData
}) {
  const [, setLocation] = useLocation()

  return (
    <>
      <h1 className="mb-10">Device details</h1>
      <div className="flex flex-col gap-4">
        <div className="-mx-5 card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1>{node.DeviceName}</h1>
              <div
                className={cx("w-2.5 h-2.5 rounded-full", {
                  "bg-emerald-500": node.Status === "Running",
                  "bg-gray-300": node.Status !== "Running",
                })}
              />
            </div>
            {!readonly && (
              <Button
                sizeVariant="small"
                onClick={() =>
                  apiFetch("/local/v0/logout", "POST")
                    .then(() => setLocation("/"))
                    .catch((err) => alert("Logout failed: " + err.message))
                }
              >
                Disconnect…
              </Button>
            )}
          </div>
        </div>
        {node.Features["auto-update"] &&
          !readonly &&
          node.ClientVersion &&
          !node.ClientVersion.RunningLatest && (
            <UpdateAvailableNotification details={node.ClientVersion} />
          )}
        <div className="-mx-5 card">
          <h2 className="mb-2">General</h2>
          <table>
            <tbody>
              <tr className="flex">
                <td>Managed by</td>
                <td className="flex gap-1 flex-wrap">
                  {node.IsTagged
                    ? node.Tags.map((t) => <ACLTag key={t} tag={t} />)
                    : node.Profile?.DisplayName}
                </td>
              </tr>
              <tr>
                <td>Machine name</td>
                <td>
                  <QuickCopy
                    primaryActionValue={node.DeviceName}
                    primaryActionSubject="machine name"
                  >
                    {node.DeviceName}
                  </QuickCopy>
                </td>
              </tr>
              <tr>
                <td>OS</td>
                <td>{node.OS}</td>
              </tr>
              <tr>
                <td>ID</td>
                <td>
                  <QuickCopy
                    primaryActionValue={node.ID}
                    primaryActionSubject="ID"
                  >
                    {node.ID}
                  </QuickCopy>
                </td>
              </tr>
              <tr>
                <td>Tailscale version</td>
                <td>{node.IPNVersion}</td>
              </tr>
              <tr>
                <td>Key expiry</td>
                <td>
                  {node.KeyExpired
                    ? "Expired"
                    : // TODO: present as relative expiry (e.g. "5 months from now")
                      new Date(node.KeyExpiry).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="-mx-5 card">
          <h2 className="mb-2">Addresses</h2>
          <table>
            <tbody>
              <tr>
                <td>Tailscale IPv4</td>
                <td>
                  <QuickCopy
                    primaryActionValue={node.IPv4}
                    primaryActionSubject="IPv4 address"
                  >
                    {node.IPv4}
                  </QuickCopy>
                </td>
              </tr>
              <tr>
                <td>Tailscale IPv6</td>
                <td>
                  <QuickCopy
                    primaryActionValue={node.IPv6}
                    primaryActionSubject="IPv6 address"
                  >
                    <NiceIP ip={node.IPv6} />
                  </QuickCopy>
                </td>
              </tr>
              <tr>
                <td>Short domain</td>
                <td>
                  <QuickCopy
                    primaryActionValue={node.DeviceName}
                    primaryActionSubject="short domain"
                  >
                    {node.DeviceName}
                  </QuickCopy>
                </td>
              </tr>
              <tr>
                <td>Full domain</td>
                <td>
                  <QuickCopy
                    primaryActionValue={`${node.DeviceName}.${node.TailnetName}`}
                    primaryActionSubject="full domain"
                  >
                    {node.DeviceName}.{node.TailnetName}
                  </QuickCopy>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer className="text-gray-500 text-sm leading-tight text-center">
          <Control.AdminContainer node={node}>
            Want even more details? Visit{" "}
            <Control.AdminLink node={node} path={`/machines/${node.IPv4}`}>
              this device’s page
            </Control.AdminLink>{" "}
            in the admin console.
          </Control.AdminContainer>
          <p className="mt-12">
            <a
              className="link"
              href={node.LicensesURL}
              target="_blank"
              rel="noreferrer"
            >
              Acknowledgements
            </a>{" "}
            ·{" "}
            <a
              className="link"
              href="https://tailscale.com/privacy-policy/"
              target="_blank"
              rel="noreferrer"
            >
              Privacy Policy
            </a>{" "}
            ·{" "}
            <a
              className="link"
              href="https://tailscale.com/terms/"
              target="_blank"
              rel="noreferrer"
            >
              Terms of Service
            </a>
          </p>
          <p className="my-2">
            WireGuard is a registered trademark of Jason A. Donenfeld.
          </p>
          <p>
            © {new Date().getFullYear()} Tailscale Inc. All rights reserved.
            Tailscale is a registered trademark of Tailscale Inc.
          </p>
        </footer>
      </div>
    </>
  )
}
