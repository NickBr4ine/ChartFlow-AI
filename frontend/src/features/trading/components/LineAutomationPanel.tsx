"use client";

import { type FormEvent, useMemo, useState } from "react";
import type { PriceLine } from "../types";
import {
  resolveCryptoPriceLine,
  type CryptoPriceLineKind,
  type CryptoPriceLineRule
} from "../utils/cryptoPriceLines";
import { normalizeMovingAveragePeriods } from "../utils/movingAverages";

interface LineAutomationPanelProps {
  readonly lastPrice: number;
  readonly movingAveragePeriods: readonly number[];
  readonly priceLineRules: readonly CryptoPriceLineRule[];
  readonly onMovingAveragePeriodsChange: (periods: readonly number[]) => void;
  readonly onPriceLineRulesChange: (rules: readonly CryptoPriceLineRule[]) => void;
}

const LINE_TYPE_OPTIONS: readonly { readonly value: CryptoPriceLineKind; readonly label: string }[] = [
  { value: "market-cap", label: "Market cap / supply" },
  { value: "target-percent", label: "Alvo percentual" },
  { value: "long-liquidation", label: "Liquidacao long" },
  { value: "short-liquidation", label: "Liquidacao short" },
  { value: "manual-price", label: "Preco manual" }
];

const FIELD_HELP = {
  sma: "Periodos das medias moveis simples desenhadas no grafico. Exemplo: 20, 50, 200 cria tres linhas de tendencia.",
  lineType: "Escolhe qual formula sera usada para calcular a linha horizontal no grafico.",
  lineName: "Nome exibido na linha do grafico e na lista de linhas criadas.",
  marketCap: "Valor de mercado desejado. Com o supply, calcula o preco teorico: market cap dividido pelo supply.",
  supply: "Quantidade circulante do ativo. Usada com market cap para estimar um preco teorico por moeda.",
  targetPercent: "Percentual aplicado sobre o preco atual. Valor positivo cria alvo acima; negativo cria alvo abaixo.",
  entryPrice: "Preco de entrada da operacao. Usado com a alavancagem para estimar a liquidacao aproximada.",
  leverage: "Multiplicador da posicao. Quanto maior a alavancagem, mais perto fica a linha de liquidacao.",
  manualPrice: "Preco fixo informado manualmente para marcar suporte, resistencia, alvo ou alerta visual."
} as const;

export function LineAutomationPanel({
  lastPrice,
  movingAveragePeriods,
  priceLineRules,
  onMovingAveragePeriodsChange,
  onPriceLineRulesChange
}: LineAutomationPanelProps) {
  const [periodInput, setPeriodInput] = useState(movingAveragePeriods.join(", "));
  const [kind, setKind] = useState<CryptoPriceLineKind>("target-percent");
  const [label, setLabel] = useState("Alvo");
  const [marketCap, setMarketCap] = useState("");
  const [circulatingSupply, setCirculatingSupply] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [targetPercent, setTargetPercent] = useState("5");
  const [leverage, setLeverage] = useState("10");
  const [manualPrice, setManualPrice] = useState("");

  const resolvedLines = useMemo(
    () => priceLineRules.map((rule) => resolveCryptoPriceLine(rule, lastPrice)).filter((line): line is PriceLine => line !== null),
    [lastPrice, priceLineRules]
  );

  const handleApplyPeriods = () => {
    const periods = normalizeMovingAveragePeriods(periodInput.split(",").map((period) => Number(period.trim()))).slice(0, 6);

    if (periods.length > 0) {
      onMovingAveragePeriodsChange(periods);
      setPeriodInput(periods.join(", "));
    }
  };

  const handleAddLine = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const rule = createRule();
    const resolved = resolveCryptoPriceLine(rule, lastPrice);

    if (!resolved) {
      return;
    }

    onPriceLineRulesChange([...priceLineRules, rule]);
    setManualPrice("");
  };

  const removeLine = (id: string) => {
    onPriceLineRulesChange(priceLineRules.filter((rule) => rule.id !== id));
  };

  const createRule = (): CryptoPriceLineRule => ({
    id: `line-${Date.now()}`,
    kind,
    label,
    marketCap: toNumber(marketCap),
    circulatingSupply: toNumber(circulatingSupply),
    entryPrice: toNumber(entryPrice),
    targetPercent: toNumber(targetPercent),
    leverage: toNumber(leverage),
    manualPrice: toNumber(manualPrice)
  });

  return (
    <article className="rounded-md border border-chart-border bg-chart-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-chart-muted">Linhas automaticas</p>
          <h3 className="mt-1 text-base font-semibold text-white">Variaveis cripto</h3>
        </div>
        <span className="rounded border border-chart-border px-2 py-1 text-xs text-chart-muted">{resolvedLines.length}</span>
      </div>

      <div className="mt-4">
        <label className="block text-sm text-chart-muted">
          <FieldLabel label="SMAs" help={FIELD_HELP.sma} />
          <div className="mt-2 flex gap-2">
            <input
              value={periodInput}
              onChange={(event) => setPeriodInput(event.target.value)}
              className="h-10 min-w-0 flex-1 rounded-md border border-chart-border bg-chart-background px-3 text-sm text-white outline-none focus:border-chart-cyan"
            />
            <button
              type="button"
              onClick={handleApplyPeriods}
              className="h-10 rounded-md border border-chart-cyan px-3 text-sm font-semibold text-chart-cyan"
            >
              Aplicar
            </button>
          </div>
        </label>
      </div>

      <form onSubmit={handleAddLine} className="mt-4 space-y-3">
        <label className="block">
          <FieldLabel label="Tipo de linha" help={FIELD_HELP.lineType} />
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as CryptoPriceLineKind)}
            className="mt-2 h-10 w-full rounded-md border border-chart-border bg-chart-background px-3 text-sm text-white outline-none focus:border-chart-cyan"
          >
            {LINE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <FieldLabel label="Nome da linha" help={FIELD_HELP.lineName} />
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="mt-2 h-10 w-full rounded-md border border-chart-border bg-chart-background px-3 text-sm text-white outline-none focus:border-chart-cyan"
            placeholder="Nome da linha"
          />
        </label>

        {kind === "market-cap" ? (
          <div className="grid grid-cols-2 gap-2">
            <NumberInput value={marketCap} onChange={setMarketCap} label="Market cap" help={FIELD_HELP.marketCap} />
            <NumberInput value={circulatingSupply} onChange={setCirculatingSupply} label="Supply" help={FIELD_HELP.supply} />
          </div>
        ) : null}

        {kind === "target-percent" ? (
          <NumberInput value={targetPercent} onChange={setTargetPercent} label="% alvo" help={FIELD_HELP.targetPercent} />
        ) : null}

        {kind === "long-liquidation" || kind === "short-liquidation" ? (
          <div className="grid grid-cols-2 gap-2">
            <NumberInput value={entryPrice} onChange={setEntryPrice} label="Entrada" help={FIELD_HELP.entryPrice} />
            <NumberInput value={leverage} onChange={setLeverage} label="Alavancagem" help={FIELD_HELP.leverage} />
          </div>
        ) : null}

        {kind === "manual-price" ? (
          <NumberInput value={manualPrice} onChange={setManualPrice} label="Preco" help={FIELD_HELP.manualPrice} />
        ) : null}

        <button type="submit" className="h-10 w-full rounded-md bg-chart-cyan px-3 text-sm font-semibold text-chart-background">
          Criar linha
        </button>
      </form>

      {resolvedLines.length > 0 ? (
        <div className="mt-4 space-y-2">
          {resolvedLines.map((line) => (
            <div key={line.id} className="flex items-center justify-between gap-3 rounded-md border border-chart-border px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{line.label}</p>
                <p className="text-xs text-chart-muted">{line.value.toFixed(4)}</p>
              </div>
              <button type="button" onClick={() => removeLine(line.id)} className="text-sm text-chart-red">
                Remover
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function FieldLabel({ label, help }: { readonly label: string; readonly help: string }) {
  return (
    <span className="flex items-center gap-1.5 text-sm text-chart-muted">
      {label}
      <span className="group relative inline-flex h-4 w-4 items-center justify-center rounded-full border border-chart-border text-[10px] font-semibold text-chart-cyan">
        ?
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-56 -translate-x-1/2 rounded-md border border-chart-border bg-[#0f141b] p-2 text-left text-xs font-normal leading-4 text-white shadow-xl group-hover:block group-focus-within:block"
        >
          {help}
        </span>
      </span>
    </span>
  );
}

function NumberInput({
  value,
  onChange,
  label,
  help
}: {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly label: string;
  readonly help: string;
}) {
  return (
    <label className="block min-w-0">
      <FieldLabel label={label} help={help} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-md border border-chart-border bg-chart-background px-3 text-sm text-white outline-none focus:border-chart-cyan"
        inputMode="decimal"
        placeholder={label}
        title={help}
      />
    </label>
  );
}

function toNumber(value: string): number | undefined {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}
